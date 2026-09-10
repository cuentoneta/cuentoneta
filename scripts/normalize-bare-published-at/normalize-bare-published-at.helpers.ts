export const PUBLISHED_AT_NORMALIZATION_PAGE_SIZE = 50;

export interface PublishedAtCandidate {
	readonly _id: string;
	readonly publishedAt?: string | null;
}

export interface PublishedAtCandidatePageFetcher {
	fetchPage(cursor: string, pageSize: number): Promise<readonly PublishedAtCandidate[]>;
}

export interface PublishedAtNormalizationWriter {
	patch(documentId: string): {
		set(attributes: { readonly publishedAt: string }): {
			commit(): Promise<unknown>;
		};
	};
}

export interface PublishedAtNormalizationReport {
	readonly inspected: number;
	readonly normalized: readonly { readonly id: string; readonly from: string; readonly to: string }[];
	readonly skipped: readonly string[];
	readonly failed: readonly { readonly id: string; readonly reason: string }[];
}

// La forma no alcanza: `2022-13-45` la cumple y produciría un instante que el value object del
// dominio acepta y el reloj no resuelve, cambiando un error ruidoso por una corrupción callada. Se
// exige además que la fecha exista, comparando contra lo que el calendario devuelve.
function namesARealDate(value: string): boolean {
	const parsed = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

// Devuelve el instante completo cuando el documento guarda la fecha desnuda, o null cuando no hay
// nada que corregir. Lanza nombrando el documento ante un valor sin disposición asignada, para que
// el recorrido lo registre como fallido en vez de escribirle un instante arbitrario.
export function normalizedPublishedAt(candidate: PublishedAtCandidate): string | null {
	const ARGENTINA_MIDNIGHT_SUFFIX = 'T03:00:00.000Z';
	const BARE_DATE = /^\d{4}-\d{2}-\d{2}$/;
	const { _id, publishedAt } = candidate;

	// Un valor que no es texto no tiene forma que corregir, y dejarlo llegar a la comparación de abajo
	// produciría un error que no nombra el documento. La ausencia —clave sin valor o campo en null—
	// no es lo que esta remediación corrige: la query ya cae a la fecha de creación cuando el campo
	// no está, y completar un instante inventado sería peor que no tener el dato.
	if (typeof publishedAt !== 'string') {
		if (publishedAt === null || typeof publishedAt === 'undefined') {
			return null;
		}
		throw new Error(
			`El documento "${_id}" guarda una fecha de publicación que no es texto: ${JSON.stringify(publishedAt)}`,
		);
	}

	// Ya tiene hora: sin patch. Es lo que hace idempotente una segunda corrida.
	if (publishedAt.includes('T')) {
		return null;
	}

	// Una forma que no es ni la sana ni la que se viene a corregir no tiene disposición asignada, y
	// completarla a ciegas escribiría un instante arbitrario sobre un dato que nadie miró.
	if (!BARE_DATE.test(publishedAt) || !namesARealDate(publishedAt)) {
		throw new Error(`El documento "${_id}" tiene una fecha de publicación de forma desconocida: "${publishedAt}"`);
	}

	return `${publishedAt}${ARGENTINA_MIDNIGHT_SUFFIX}`;
}

// Una página corta (o vacía) es el final del recorrido: no hay más documentos que pedir.
export function nextCursor(page: readonly PublishedAtCandidate[], pageSize: number): string | null {
	return page.length === pageSize ? (page[page.length - 1]?._id ?? null) : null;
}

interface RunOptions {
	readonly fetcher: PublishedAtCandidatePageFetcher;
	readonly writer: PublishedAtNormalizationWriter;
	readonly apply: boolean;
	readonly pageSize?: number;
}

export async function runPublishedAtNormalization(options: RunOptions): Promise<PublishedAtNormalizationReport> {
	const pageSize = options.pageSize ?? PUBLISHED_AT_NORMALIZATION_PAGE_SIZE;
	const normalized: { id: string; from: string; to: string }[] = [];
	const skipped: string[] = [];
	const failed: { id: string; reason: string }[] = [];
	let inspected = 0;
	let cursor: string | null = '';

	while (cursor !== null) {
		const page = await options.fetcher.fetchPage(cursor, pageSize);
		for (const candidate of page) {
			inspected++;
			await processCandidate(candidate, options, { normalized, skipped, failed });
		}
		cursor = nextCursor(page, pageSize);
	}

	return { inspected, normalized, skipped, failed };
}

// Cada documento se procesa aislado: uno con una forma desconocida se registra como fallido y el
// recorrido sigue. Un documento roto no puede abortar la remediación del catálogo.
async function processCandidate(
	candidate: PublishedAtCandidate,
	options: RunOptions,
	buckets: {
		normalized: { id: string; from: string; to: string }[];
		skipped: string[];
		failed: { id: string; reason: string }[];
	},
): Promise<void> {
	try {
		const fixed = normalizedPublishedAt(candidate);
		if (fixed === null) {
			buckets.skipped.push(candidate._id);
			return;
		}
		if (options.apply) {
			await options.writer.patch(candidate._id).set({ publishedAt: fixed }).commit();
		}
		buckets.normalized.push({ id: candidate._id, from: candidate.publishedAt ?? '', to: fixed });
	} catch (error) {
		buckets.failed.push({ id: candidate._id, reason: error instanceof Error ? error.message : String(error) });
	}
}

export function formatPublishedAtNormalizationReport(
	report: PublishedAtNormalizationReport,
	options: { apply: boolean },
): string[] {
	const verb = options.apply ? 'Normalizadas' : 'Se normalizarían';
	const lines = [
		`Obras inspeccionadas: ${report.inspected}`,
		`${verb}: ${report.normalized.length}`,
		...report.normalized.map((entry) => `  · ${entry.id} — ${entry.from} → ${entry.to}`),
		`Ya normalizadas (sin cambios): ${report.skipped.length}`,
		`Fallidas: ${report.failed.length}`,
		...report.failed.map((entry) => `  · ${entry.id} — ${entry.reason}`),
	];

	if (!options.apply && report.normalized.length > 0) {
		lines.push('', 'Corrida en seco. Para persistir: pnpm normalize:bare-published-at --no-dry-run');
	}
	return lines;
}
