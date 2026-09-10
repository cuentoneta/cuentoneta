export const RESOURCE_SANITIZATION_PAGE_SIZE = 50;

export interface ResourceCandidate {
	readonly _key: string;
	readonly url?: string | null;
	readonly title?: string;
}

export interface SanitizeCandidate {
	readonly _id: string;
	readonly _type: string;
	readonly slug?: string;
	readonly resources?: readonly ResourceCandidate[];
}

export interface ResourceCandidatePageFetcher {
	fetchPage(cursor: string, pageSize: number): Promise<readonly SanitizeCandidate[]>;
}

export interface ResourceSanitizationWriter {
	patch(documentId: string): {
		set(attributes: { readonly resources: readonly ResourceCandidate[] }): {
			commit(): Promise<unknown>;
		};
	};
}

export interface ResourceSanitizationReport {
	readonly inspected: number;
	readonly sanitized: readonly string[];
	readonly skipped: readonly string[];
	readonly failed: readonly { readonly id: string; readonly reason: string }[];
}

function lacksUrl(resource: ResourceCandidate): boolean {
	return typeof resource.url !== 'string' || resource.url.length === 0;
}

// Dos perfiles cargados sin protocolo, que la validación de forma del schema rechazaría. Se indexan
// por su URL literal porque es el dato que identifica al recurso, y no hay dos iguales.
function schemelessUrlFixes(): ReadonlyMap<string, string> {
	return new Map([
		['instagram.com/conspiraciondelosfuleros', 'https://instagram.com/conspiraciondelosfuleros'],
		['youtube.com/@conspiraciondelosfuleros7233', 'https://youtube.com/@conspiraciondelosfuleros7233'],
	]);
}

// Las claves del mapa, para la consulta de candidatas del runner: un documento con una de estas
// URLs entra al recorrido aunque no tenga ningún recurso sin URL.
export function schemelessUrls(): readonly string[] {
	return [...schemelessUrlFixes().keys()];
}

// El `_key` se lee del documento y la disposición se indexa por slug: los `_key` del censo salieron
// de production y la remediación corre en los tres datasets, donde no hay garantía de que coincidan.
function authorDispositions(
	candidate: SanitizeCandidate,
	incompleteKeys: ReadonlySet<string>,
): ReadonlyMap<string, string | null> {
	// El artículo de Wikipedia que cada recurso prometía, verificado uno por uno contra la API de
	// MediaWiki. Un autor ausente de este mapa pierde su recurso: es la disposición de quien no tiene
	// artículo al que apuntar.
	const AUTHOR_RESOURCE_URLS: Readonly<Partial<Record<string, string>>> = {
		'algernon-blackwood': 'https://es.wikipedia.org/wiki/Algernon_Blackwood',
		'ambrose-bierce': 'https://es.wikipedia.org/wiki/Ambrose_Bierce',
		'don-juan-manuel': 'https://es.wikipedia.org/wiki/Don_Juan_Manuel',
		'eta-hoffmann': 'https://es.wikipedia.org/wiki/E._T._A._Hoffmann',
		'frida-kahlo': 'https://es.wikipedia.org/wiki/Frida_Kahlo',
		'h-rider-haggard': 'https://es.wikipedia.org/wiki/H._Rider_Haggard',
		'jean-ray': 'https://es.wikipedia.org/wiki/Jean_Ray',
		'khalil-gibran': 'https://es.wikipedia.org/wiki/Yibr%C3%A1n_Jalil_Yibr%C3%A1n',
		'kurt-vonnegut': 'https://es.wikipedia.org/wiki/Kurt_Vonnegut',
		'leon-tolstoi': 'https://es.wikipedia.org/wiki/Le%C3%B3n_Tolst%C3%B3i',
		'margaret-st-clair': 'https://es.wikipedia.org/wiki/Margaret_St._Clair',
		'natalia-ginzburg': 'https://es.wikipedia.org/wiki/Natalia_Ginzburg',
		'nathaniel-hawthorne': 'https://es.wikipedia.org/wiki/Nathaniel_Hawthorne',
		'neil-gaiman': 'https://es.wikipedia.org/wiki/Neil_Gaiman',
		'selma-lagerlof': 'https://es.wikipedia.org/wiki/Selma_Lagerl%C3%B6f',
		'the-monty-python': 'https://es.wikipedia.org/wiki/Monty_Python',
	};
	// El único autor cuyo recurso se borra en vez de completarse: "Anónimo" no nombra a una persona,
	// y el artículo al que redirige trata sobre el anonimato como concepto.
	const AUTHORS_WITHOUT_ARTICLE: readonly string[] = ['anonimo'];

	const slug = candidate.slug ?? '';
	const url = AUTHOR_RESOURCE_URLS[slug];

	// Sin recursos incompletos no hay disposición que resolver: la tabla solo se consulta cuando hay
	// algo que completar o borrar.
	if (incompleteKeys.size === 0) {
		return new Map();
	}

	// Un autor que se sume después no debe pasar en silencio por una remediación que cree haberlo
	// cubierto: sin entrada en el mapa ni en la lista de excepciones, no hay disposición que aplicar.
	// El borrador es la excepción: una fila de recurso a medio completar es el estado normal apenas se
	// agrega un ítem en el Studio, y abortar por eso detendría la corrida sobre contenido publicado.
	if (!url && !AUTHORS_WITHOUT_ARTICLE.includes(slug)) {
		if (candidate._id.startsWith('drafts.')) {
			return new Map();
		}
		throw new Error(
			`El autor "${slug || candidate._id}" tiene un recurso sin URL y no figura en la tabla de disposición`,
		);
	}

	// La tabla asigna una URL por autor, así que dos recursos incompletos en el mismo documento
	// quedarían apuntando ambos al mismo artículo. El censo dice que no pasa; esto lo afirma.
	if (url && incompleteKeys.size > 1) {
		throw new Error(`El autor "${slug}" tiene ${incompleteKeys.size} recursos sin URL y la tabla asigna una sola`);
	}

	return new Map([...incompleteKeys].map((key) => [key, url ?? null] as const));
}

// En la obra no hay tabla: el recurso no nombra ningún destino averiguable, así que la única
// disposición posible es borrarlo. Al no enumerar documentos, un caso nuevo con el mismo hueco queda
// cubierto por definición — siempre que sea el mismo caso, que es lo que verifica el título.
function workDispositions(
	candidate: SanitizeCandidate,
	incompleteKeys: ReadonlySet<string>,
): ReadonlyMap<string, string | null> {
	// El título con el que se cargaron los recursos incompletos de las obras. La disposición de
	// borrarlos se apoya en que ese título no nombra ningún destino averiguable, así que la
	// remediación lo verifica en vez de darlo por cierto: es su única operación destructiva.
	const WORK_RESOURCE_TITLE = 'Enlace a recurso original';

	const unexpected =
		(candidate.resources ?? []).find(
			(resource) => incompleteKeys.has(resource._key) && resource.title !== WORK_RESOURCE_TITLE,
		) ?? null;
	if (unexpected !== null) {
		throw new Error(
			`La obra "${candidate.slug ?? candidate._id}" tiene un recurso sin URL titulado "${unexpected.title}", ajeno al lote que esta remediación borra`,
		);
	}

	return new Map([...incompleteKeys].map((key) => [key, null] as const));
}

// Devuelve los recursos con el saneamiento aplicado, o null cuando no hay nada que corregir. Lanza
// nombrando el documento ante un caso sin disposición asignada, para que el recorrido lo registre
// como fallido en vez de destruir un dato que nadie evaluó.
export function sanitizedResources(candidate: SanitizeCandidate): readonly ResourceCandidate[] | null {
	const resources = candidate.resources ?? [];
	const incompleteKeys = new Set(resources.filter(lacksUrl).map((resource) => resource._key));
	const fixes = schemelessUrlFixes();
	if (incompleteKeys.size === 0 && !resources.some((resource) => fixes.has(resource.url ?? ''))) {
		return null;
	}

	const dispositions =
		candidate._type === 'author'
			? authorDispositions(candidate, incompleteKeys)
			: workDispositions(candidate, incompleteKeys);

	let changed = false;
	const sanitized = resources.flatMap((resource) => {
		if (dispositions.has(resource._key)) {
			changed = true;
			const url: string | null = dispositions.get(resource._key) ?? null;
			return url === null ? [] : [{ ...resource, url }];
		}
		const fixed: string | null = typeof resource.url === 'string' ? (fixes.get(resource.url) ?? null) : null;
		if (fixed === null) {
			return [resource];
		}
		changed = true;
		return [{ ...resource, url: fixed }];
	});

	return changed ? sanitized : null;
}

// Una página corta (o vacía) es el final del recorrido: no hay más documentos que pedir.
export function nextCursor(page: readonly SanitizeCandidate[], pageSize: number): string | null {
	return page.length === pageSize ? (page[page.length - 1]?._id ?? null) : null;
}

interface RunOptions {
	readonly fetcher: ResourceCandidatePageFetcher;
	readonly writer: ResourceSanitizationWriter;
	readonly apply: boolean;
	readonly pageSize?: number;
}

export async function runResourceSanitization(options: RunOptions): Promise<ResourceSanitizationReport> {
	const pageSize = options.pageSize ?? RESOURCE_SANITIZATION_PAGE_SIZE;
	const sanitized: string[] = [];
	const skipped: string[] = [];
	const failed: { id: string; reason: string }[] = [];
	let inspected = 0;
	let cursor: string | null = '';

	while (cursor !== null) {
		const page = await options.fetcher.fetchPage(cursor, pageSize);
		for (const candidate of page) {
			inspected++;
			await processCandidate(candidate, options, { sanitized, skipped, failed });
		}
		cursor = nextCursor(page, pageSize);
	}

	return { inspected, sanitized, skipped, failed };
}

// Cada documento se procesa aislado: uno con un caso sin disposición se registra como fallido y el
// recorrido sigue. Un documento roto no puede abortar el saneamiento del catálogo.
async function processCandidate(
	candidate: SanitizeCandidate,
	options: RunOptions,
	buckets: {
		sanitized: string[];
		skipped: string[];
		failed: { id: string; reason: string }[];
	},
): Promise<void> {
	try {
		const fixed = sanitizedResources(candidate);
		if (fixed === null) {
			buckets.skipped.push(candidate._id);
			return;
		}
		if (options.apply) {
			await options.writer.patch(candidate._id).set({ resources: fixed }).commit();
		}
		buckets.sanitized.push(candidate._id);
	} catch (error) {
		buckets.failed.push({ id: candidate._id, reason: error instanceof Error ? error.message : String(error) });
	}
}

export function formatResourceSanitizationReport(
	report: ResourceSanitizationReport,
	options: { apply: boolean },
): string[] {
	const verb = options.apply ? 'Saneados' : 'Se sanearían';
	const lines = [
		`Documentos inspeccionados: ${report.inspected}`,
		`${verb}: ${report.sanitized.length}`,
		...report.sanitized.map((id) => `  · ${id}`),
		`Ya saneados (sin cambios): ${report.skipped.length}`,
		`Fallidos: ${report.failed.length}`,
		...report.failed.map((entry) => `  · ${entry.id} — ${entry.reason}`),
	];

	if (!options.apply && report.sanitized.length > 0) {
		lines.push('', 'Corrida en seco. Para persistir: pnpm sanitize:resources-without-url --no-dry-run');
	}
	return lines;
}
