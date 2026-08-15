/**
 * Helpers puros del smoke de indexado (sin I/O): parseo del sitemap, muestreo y derivación de las
 * expectations por tipo de página. Separados de `seo-smoke.ts` (orquestación/red) para poder testearlos
 * sin levantar un server ni tocar la red.
 */
import type { IndexableHtmlExpectations } from '../e2e/_utils/seo-invariants';
import { parseHtml, parseJsonLdBlocks } from '../e2e/_utils/seo';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../e2e/_utils/seo-fixtures';
import { childElementSequences } from '../src/testing/sitemap-xml';

export function slugOf(path: string): string {
	return path.split('/').filter(Boolean).pop() ?? '';
}

// Deriva un patrón tolerante del slug: matchea (accent-insensitive) el token más distintivo (el más
// largo), lo bastante robusto ante sufijos de desambiguación (`-2`) y stopwords cortas.
export function slugToTitlePattern(slug: string): RegExp {
	// Vocales/consonantes que el slugify de Sanity aplana: el título conserva el acento/ñ, el slug no.
	const letterVariants: Record<string, string> = {
		a: 'aáàäâ',
		e: 'eéèëê',
		i: 'iíìïî',
		o: 'oóòöô',
		u: 'uúùüû',
		n: 'nñ',
		c: 'cç',
	};
	const token =
		[
			...slug
				.toLowerCase()
				.split('-')
				.filter((word) => /[a-z]/.test(word)),
		].sort((a, b) => b.length - a.length)[0] ?? slug;
	const body = [...token].map((char) => (letterVariants[char] ? `[${letterVariants[char]}]` : char)).join('');
	return new RegExp(body, 'i');
}

export function toPath(loc: string): string | null {
	try {
		return new URL(loc.trim()).pathname;
	} catch {
		return null;
	}
}

export function parseSitemap(xml: string): string[] {
	return parseHtml(xml)
		.querySelectorAll('loc')
		.map((element) => toPath(element.text))
		.filter((path): path is string => path !== null);
}

export function sample(paths: readonly string[], size: number): string[] {
	const pool = [...paths];
	const picked: string[] = [];
	while (picked.length < size && pool.length > 0) {
		const [chosen] = pool.splice(Math.floor(Math.random() * pool.length), 1);
		picked.push(chosen);
	}
	return picked;
}

export function selectByType(paths: readonly string[], prefix: string, size: number, full: boolean): string[] {
	const ofType = paths.filter((path) => path.startsWith(prefix));
	return full ? ofType : sample(ofType, size);
}

export function expectationsFor(path: string): IndexableHtmlExpectations | null {
	if (path.startsWith('/story/')) {
		const pattern = slugToTitlePattern(slugOf(path));
		return {
			path,
			canonicalContains: path,
			titlePattern: pattern,
			h1Pattern: pattern,
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.article, SCHEMA_IDS.breadcrumbStory],
			requiredInternalLinkPrefix: '/author/',
		};
	}
	if (path.startsWith('/author/')) {
		return {
			path,
			canonicalContains: path,
			titlePattern: slugToTitlePattern(slugOf(path)),
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.profilePage, SCHEMA_IDS.breadcrumbAuthor],
			requiredInternalLinkPrefix: '/story/',
		};
	}
	if (path.startsWith('/storylist/')) {
		// El título de la storylist es editorial (no deriva del slug); sin titlePattern/h1Pattern.
		return {
			path,
			canonicalContains: path,
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.collection, SCHEMA_IDS.breadcrumbStorylist],
			requiredInternalLinkPrefix: '/story/',
		};
	}
	return null;
}

// Cuando una fecha se repite en más de esta proporción del sitemap, ya no está describiendo cuándo
// cambió cada página: está describiendo cuándo se corrió una operación en lote. El valor separa los
// dos estados medidos —un corpus contaminado por una escritura masiva llegó a concentrar la mitad de
// las fechas en una sola, y uno derivado de fechas de origen no pasó de unas pocas centésimas—, con
// margen para un día de alta editorial legítimo.
const LASTMOD_CLUSTER_LIMIT = 0.25;

const IGNORED_ELEMENTS = ['changefreq', 'priority'];

export interface SitemapReport {
	urls: number;
	dated: number;
	distinctDates: number;
	largestCluster: { date: string; share: number } | null;
	violations: string[];
}

function largestCluster(dates: readonly string[]): { date: string; share: number } | null {
	const counts = new Map<string, number>();
	dates.forEach((date) => counts.set(date, (counts.get(date) ?? 0) + 1));
	const ranked = [...counts.entries()].sort(([, a], [, b]) => b - a);
	const [top] = ranked;
	return top ? { date: top[0], share: top[1] / dates.length } : null;
}

/**
 * Invariantes del documento del sitemap: la secuencia de elementos que exige su esquema y que la
 * fecha de modificación siga siendo una señal y no el rastro de la última escritura masiva.
 *
 * Lo segundo no se puede verificar en un test: necesita el corpus real de un despliegue, que es
 * justamente lo que este smoke tiene a mano.
 */
export function collectSitemapViolations(xml: string): SitemapReport {
	const sequences = childElementSequences(xml);
	const dates = parseHtml(xml)
		.querySelectorAll('lastmod')
		.map((element) => element.text.trim());
	const cluster = largestCluster(dates);
	const violations: string[] = [];

	if (sequences.length === 0) {
		violations.push('El sitemap no expone ninguna entrada <url>.');
	}

	const outOfOrder = sequences.filter(
		(sequence) => sequence.join(',') !== 'loc,lastmod' && sequence.join(',') !== 'loc',
	);
	if (outOfOrder.length > 0) {
		violations.push(
			`Hay entradas que no respetan la secuencia del esquema (loc → lastmod). Primera encontrada: ${outOfOrder[0]?.join(' → ')}.`,
		);
	}

	IGNORED_ELEMENTS.filter((element) => xml.includes(`<${element}>`)).forEach((element) =>
		violations.push(`El sitemap emite <${element}>, que los buscadores ignoran.`),
	);

	if (cluster && cluster.share > LASTMOD_CLUSTER_LIMIT) {
		violations.push(
			`El ${Math.round(cluster.share * 100)}% de las fechas es ${cluster.date}: el lastmod está reflejando una escritura en lote, no cambios de contenido.`,
		);
	}

	return {
		urls: parseHtml(xml).querySelectorAll('loc').length,
		dated: dates.length,
		distinctDates: new Set(dates).size,
		largestCluster: cluster,
		violations,
	};
}

/**
 * A diferencia del build de e2e (base relativa, `website='/'`, url sitewide vacía), el smoke corre
 * contra prod real (BASE_URL absoluto): ahí las entidades sitewide DEBEN llevar una url absoluta. Este
 * check —exclusivo del smoke— atrapa un `environment.website` mal configurado en el deploy (url vacía o
 * relativa), el único modo de falla que ni los unit tests (input hardcodeado) ni el e2e (base relativa) ven.
 */
export function checkSitewideAbsoluteUrls(html: string): string[] {
	try {
		const blocks = parseJsonLdBlocks(html);
		return SITEWIDE_SCHEMA_IDS.flatMap((id) => {
			const url = blocks.get(id)?.['url'];
			return typeof url === 'string' && /^https?:\/\//.test(url)
				? []
				: [`El bloque sitewide "${id}" no expone una url absoluta (encontrado: ${JSON.stringify(url)}).`];
		});
	} catch {
		return []; // un bloque malformado ya lo reporta collectIndexableHtmlViolations; no duplicamos
	}
}
