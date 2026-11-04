import { buildSourceIndex, diffAgainstDestination, type SanityDocument, type SourceEntry } from './references';
import { runWithBackoff, toMilliseconds, type Attempt, type Clock } from './retry';

/** Lee del dataset destino los documentos pedidos; los que no existen simplemente no vuelven. */
export interface DestinationReader {
	fetchDocuments(ids: readonly string[]): Promise<SanityDocument[]>;
}

/** Quita el `_weak` de los paths de un documento, solo si sigue en la revisión que se leyó. */
export interface UnsetPatch {
	readonly id: string;
	readonly rev: string;
	readonly paths: readonly string[];
}

/** Escribe un lote de patches en una sola transacción: se aplican todos o ninguno. */
export interface ReferenceWriter {
	commitUnsets(batch: readonly UnsetPatch[]): Promise<void>;
}

export interface Failure {
	readonly id: string;
	readonly reason: string;
}

/**
 * Estado del destino al terminar. `pending` es lo que todavía falta fortalecer: en seco, todo lo que
 * se fortalecería; aplicando, lo que quedó débil después de la última pasada.
 */
export interface StrengthenReport {
	readonly inspected: number;
	readonly strengthened: number;
	readonly missing: readonly string[];
	readonly unresolvedAssets: readonly string[];
	readonly pending: readonly UnsetPatch[];
	readonly failed: readonly Failure[];
}

export interface StrengthenOptions {
	readonly source: string;
	readonly apply: boolean;
}

interface Detection {
	readonly missing: string[];
	readonly unresolvedAssets: string[];
	readonly pending: UnsetPatch[];
}

/** Devuelve el dataset si es un destino válido; lanza si falta o si es `production`, que solo se lee. */
export function assertNotProductionDataset(dataset: string | undefined): string {
	if (!dataset) {
		throw new Error('No hay dataset destino configurado: se aborta sin leer ni escribir.');
	}
	if (dataset === 'production') {
		throw new Error('El dataset destino no puede ser production: es el origen del sync y nunca se escribe.');
	}
	return dataset;
}

/** Lee `--source=<ruta>` (obligatorio) y `--apply`; lanza ante cualquier otro argumento. */
export function parseArgs(argv: readonly string[]): StrengthenOptions {
	let source: string | undefined;
	let apply = false;
	for (const arg of argv) {
		if (arg === '--apply') {
			apply = true;
		} else if (arg.startsWith('--source=') && arg.length > '--source='.length) {
			source = arg.slice('--source='.length);
		} else {
			throw new Error(`Argumento no reconocido: "${arg}"`);
		}
	}
	if (!source) {
		throw new Error('Falta --source=<ruta al data.ndjson del export de origen>.');
	}
	return { source, apply };
}

function chunk<T>(items: readonly T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

async function detect(index: ReadonlyMap<string, SourceEntry>, reader: DestinationReader): Promise<Detection> {
	const readBatchSize = 100;
	const detection: Detection = { missing: [], unresolvedAssets: [], pending: [] };
	for (const ids of chunk([...index.keys()], readBatchSize)) {
		const found = new Map((await reader.fetchDocuments(ids)).map((doc) => [doc._id, doc] as const));
		for (const id of ids) {
			recordDiff(detection, id, index.get(id), found.get(id));
		}
	}
	return detection;
}

function recordDiff(detection: Detection, id: string, source: SourceEntry | undefined, destination?: SanityDocument) {
	if (!source) {
		return;
	}
	const diff = diffAgainstDestination(source, destination);
	if (diff.kind === 'missing') {
		detection.missing.push(id);
		return;
	}
	detection.unresolvedAssets.push(...diff.unresolvedAssets.map((path) => `${id} ${path}`));
	if (diff.unsetPaths.length > 0) {
		detection.pending.push({ id, rev: diff.rev, paths: diff.unsetPaths });
	}
}

function describeError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

// Espacia todas las transacciones del run, incluidas las de aislamiento: el límite es por IP y no
// distingue un lote de un documento suelto.
function createPacedCommit(writer: ReferenceWriter, clock: Clock) {
	// Las transacciones van de a una: esta pausa deja el ritmo muy por debajo del límite de mutaciones
	// por segundo que Sanity aplica por IP, que es justo el que la ráfaga del import supera.
	const pauseBetweenTransactions = '200ms';
	let first = true;
	return async (batch: readonly UnsetPatch[]): Promise<Attempt<void>> => {
		if (!first) {
			await clock.sleep(toMilliseconds(pauseBetweenTransactions));
		}
		first = false;
		return runWithBackoff(() => writer.commitUnsets(batch), clock);
	};
}

// Un lote que falla sin reintento posible se reparte de a un documento, para que una revisión vencida
// o un documento roto no arrastren a los otros veintinueve.
async function applyPending(pending: readonly UnsetPatch[], commit: ReturnType<typeof createPacedCommit>) {
	// El mismo tamaño de lote que usa el import para fortalecer.
	const writeBatchSize = 30;
	let written = 0;
	const failed: Failure[] = [];
	for (const batch of chunk(pending, writeBatchSize)) {
		if ((await commit(batch)).ok) {
			written += batch.length;
			continue;
		}
		for (const patch of batch) {
			const result = await commit([patch]);
			if (result.ok) {
				written++;
			} else {
				failed.push({ id: patch.id, reason: describeError(result.error) });
			}
		}
	}
	return { written, failed };
}

/**
 * Fortalece en el destino las referencias que el origen declara fuertes y vuelve a detectar después
 * de cada pasada, hasta que no quede ninguna o se agoten las pasadas. En seco solo detecta.
 */
export async function runStrengthen(params: {
	sourceDocuments: Iterable<SanityDocument>;
	reader: DestinationReader;
	writer: ReferenceWriter;
	apply: boolean;
	clock: Clock;
}): Promise<StrengthenReport> {
	const maxPasses = 3;
	const index = buildSourceIndex(params.sourceDocuments);
	const commit = createPacedCommit(params.writer, params.clock);
	let detection = await detect(index, params.reader);
	let strengthened = 0;
	let failed: Failure[] = [];
	for (let pass = 0; params.apply && pass < maxPasses && detection.pending.length > 0; pass++) {
		const result = await applyPending(detection.pending, commit);
		strengthened += result.written;
		failed = result.failed;
		detection = await detect(index, params.reader);
	}
	const stillPending = new Set(detection.pending.map((patch) => patch.id));
	return {
		inspected: index.size,
		strengthened,
		...detection,
		failed: failed.filter((failure) => stillPending.has(failure.id)),
	};
}

/**
 * 0 si el destino quedó como el origen; 1 si faltan documentos o assets, o si aplicando quedaron
 * referencias débiles; 2 en seco cuando hay algo para fortalecer.
 */
export function exitCodeFor(report: StrengthenReport, options: { apply: boolean }): number {
	if (report.missing.length > 0 || report.unresolvedAssets.length > 0) {
		return 1;
	}
	if (report.pending.length > 0) {
		return options.apply ? 1 : 2;
	}
	return 0;
}

function listed(label: string, items: readonly string[]): string[] {
	const listedIds = 20;
	if (items.length === 0) {
		return [];
	}
	const rest = items.length > listedIds ? [`  … y ${items.length - listedIds} más`] : [];
	return [`${label}:`, ...items.slice(0, listedIds).map((item) => `  · ${item}`), ...rest];
}

/** Las líneas del reporte para el log y el resumen del job. */
export function formatReport(report: StrengthenReport, options: { apply: boolean; dataset: string }): string[] {
	return [
		`Referencias débiles — dataset ${options.dataset}, modo ${options.apply ? 'APLICAR' : 'seco'}`,
		`Documentos inspeccionados: ${report.inspected}`,
		`Documentos fortalecidos: ${report.strengthened}`,
		`Documentos con referencias débiles pendientes: ${report.pending.length}`,
		`Documentos faltantes: ${report.missing.length}`,
		`Assets sin enlazar: ${report.unresolvedAssets.length}`,
		...listed('Pendientes', report.pending.map((patch) => `${patch.id} (${patch.paths.length})`)),
		...listed('Faltantes', report.missing),
		...listed('Assets sin enlazar', report.unresolvedAssets),
		...listed('Fallidos', report.failed.map((failure) => `${failure.id}: ${failure.reason}`)),
	];
}
