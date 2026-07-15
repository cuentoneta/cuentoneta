/**
 * Core puro de invariantes de indexado sobre el HTML SSR crudo (sin ejecutar JS).
 *
 * Framework-agnóstico: opera sobre un `string` de HTML, sin importar Playwright ni Vitest.
 * Lo consumen tanto los specs de e2e (gate de CI) como el script de smoke post-deploy, para que
 * ambos afirmen exactamente las mismas invariantes sin drift.
 *
 * Los checks de contenido (heading, contenido primario, skeleton, enlaces internos) operan sobre
 * el `<main>` de la página, no sobre el HTML completo: el chrome global (header/footer) vive en el
 * shell (`app.component`) como hermano del `<router-outlet>`, así que medir dentro de `<main>` aísla
 * lo que cada página aporta del cascarón compartido.
 */
import { escapeRegExp, getCanonicalHref, getMetaContent, getTitleText, parseJsonLdBlocks } from './seo';

export interface Violation {
	readonly rule: string;
	readonly message: string;
}

export interface IndexableHtmlExpectations {
	readonly path: string;
	readonly titlePattern?: RegExp;
	readonly h1Pattern?: RegExp;
	readonly requiredJsonLdIds: readonly string[];
	readonly requiredInternalLinkPrefix?: string;
	readonly minPrimaryContentLength?: number;
	// Substring esperado en la canónica cuando NO coincide con `path` (p. ej. home canonicaliza a la
	// raíz del sitio, no a `/home`). Por defecto se afirma que la canónica contiene `path`.
	readonly canonicalContains?: string;
}

// Umbral por defecto de texto en `<main>`: muy por debajo del contenido real de los fixtures (bio,
// cuerpo del cuento, ficha técnica) pero muy por encima del ruido de whitespace/tags de un skeleton.
const DEFAULT_MIN_PRIMARY_CONTENT_LENGTH = 120;

function extractMain(html: string): string {
	return html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? '';
}

function stripTags(fragment: string): string {
	return fragment
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function checkNgServerContext(html: string): Violation | null {
	if (/ng-server-context="ssr"/.test(html)) {
		return null;
	}
	const actual = html.match(/ng-server-context="([^"]*)"/)?.[1] ?? '(ausente)';
	return {
		rule: 'server-render-context',
		message: `Se esperaba ng-server-context="ssr"; se encontró "${actual}" (deopt a CSR).`,
	};
}

export function checkTitle(html: string, pattern?: RegExp): Violation | null {
	const title = getTitleText(html)?.trim();
	if (!title) {
		return { rule: 'title', message: 'El <title> está vacío o ausente.' };
	}
	if (pattern && !pattern.test(title)) {
		return { rule: 'title', message: `El <title> "${title}" no matchea ${pattern}.` };
	}
	return null;
}

export function checkCanonical(html: string, path: string): Violation | null {
	const href = getCanonicalHref(html);
	if (href?.includes(path)) {
		return null;
	}
	return {
		rule: 'canonical',
		message: `Se esperaba <link rel="canonical"> conteniendo "${path}"; se encontró "${href ?? '(ausente)'}".`,
	};
}

export function checkRobotsIndexable(html: string): Violation | null {
	const robots = getMetaContent(html, 'robots');
	if (robots && !/noindex/i.test(robots) && /index/i.test(robots)) {
		return null;
	}
	return {
		rule: 'robots-indexable',
		message: `Se esperaba <meta name="robots"> indexable; se encontró "${robots ?? '(ausente)'}".`,
	};
}

export function checkPrimaryHeading(html: string, pattern?: RegExp): Violation | null {
	const main = extractMain(html);
	const headings = [...main.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
		.map((match) => stripTags(match[1]))
		.filter((text) => text.length > 0);
	if (headings.length === 0) {
		return { rule: 'primary-heading', message: 'No hay <h1> con texto real dentro de <main>.' };
	}
	if (pattern && !headings.some((text) => pattern.test(text))) {
		return {
			rule: 'primary-heading',
			message: `Ningún <h1> dentro de <main> matchea ${pattern}. Encontrados: ${JSON.stringify(headings)}.`,
		};
	}
	return null;
}

export function checkPrimaryContentLength(
	html: string,
	minLength: number = DEFAULT_MIN_PRIMARY_CONTENT_LENGTH,
): Violation | null {
	const length = stripTags(extractMain(html)).length;
	if (length >= minLength) {
		return null;
	}
	return {
		rule: 'primary-content',
		message: `El texto dentro de <main> tiene ${length} caracteres; se esperaban ≥ ${minLength}.`,
	};
}

export function checkNoSkeletonMarkers(html: string): Violation | null {
	if (/data-testid="skeleton"/.test(extractMain(html))) {
		return {
			rule: 'no-skeleton',
			message:
				'Hay markers de skeleton (data-testid="skeleton") dentro de <main>: el SSR sirve un placeholder de carga.',
		};
	}
	return null;
}

export function checkInternalLink(html: string, prefix: string): Violation | null {
	const anchor = new RegExp(`<a\\b[^>]*\\shref="${escapeRegExp(prefix)}`, 'i');
	if (anchor.test(extractMain(html))) {
		return null;
	}
	return {
		rule: 'internal-link',
		message: `No hay ningún enlace <a> con href que empiece en "${prefix}" dentro de <main>.`,
	};
}

export function checkJsonLdBlocksPresent(html: string, ids: readonly string[]): Violation[] {
	let blocks: Map<string, Record<string, unknown>>;
	try {
		blocks = parseJsonLdBlocks(html);
	} catch (error) {
		return [
			{
				rule: 'json-ld',
				message: `No se pudieron parsear los bloques JSON-LD: ${error instanceof Error ? error.message : String(error)}`,
			},
		];
	}
	return ids
		.filter((id) => !blocks.has(id))
		.map((id) => ({ rule: 'json-ld', message: `Falta el bloque JSON-LD con data-schema-id="${id}".` }));
}

/**
 * Corre todos los checks aplicables y devuelve TODAS las violaciones (no fail-fast), para que un
 * test rojo reporte de una vez el set completo de invariantes incumplidas.
 */
export function collectIndexableHtmlViolations(html: string, expectations: IndexableHtmlExpectations): Violation[] {
	const checks: (Violation | null)[] = [
		checkNgServerContext(html),
		checkTitle(html, expectations.titlePattern),
		checkCanonical(html, expectations.canonicalContains ?? expectations.path),
		checkRobotsIndexable(html),
		checkPrimaryHeading(html, expectations.h1Pattern),
		checkPrimaryContentLength(html, expectations.minPrimaryContentLength),
		checkNoSkeletonMarkers(html),
		expectations.requiredInternalLinkPrefix ? checkInternalLink(html, expectations.requiredInternalLinkPrefix) : null,
	];
	return [
		...checks.filter((violation): violation is Violation => violation !== null),
		...checkJsonLdBlocksPresent(html, expectations.requiredJsonLdIds),
	];
}

export function assertIndexableHtml(html: string, expectations: IndexableHtmlExpectations): void {
	const violations = collectIndexableHtmlViolations(html, expectations);
	if (violations.length === 0) {
		return;
	}
	const detail = violations.map((violation) => `  - [${violation.rule}] ${violation.message}`).join('\n');
	throw new Error(`HTML no indexable para "${expectations.path}":\n${detail}`);
}
