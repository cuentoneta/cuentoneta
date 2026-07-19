/**
 * Core puro de invariantes de indexado sobre el HTML SSR crudo (sin ejecutar JS).
 *
 * Framework-agnóstico: recibe un `string` de HTML y lo parsea con `node-html-parser` (corre en Node
 * plano y en happy-dom), sin importar Playwright ni Vitest. Lo consumen tanto los specs de e2e (gate
 * de CI) como el script de smoke post-deploy, para que ambos afirmen las mismas invariantes sin drift.
 *
 * La API pública (`check*` + `collectIndexableHtmlViolations`) toma `string`; internamente cada check
 * consulta el DOM por selector CSS, así afirma el elemento exacto (p. ej. `ng-server-context` vive en
 * `<cuentoneta-root>`, no en cualquier parte del HTML). Los checks de contenido (heading, contenido
 * primario, skeleton, enlaces internos) se acotan a `<main>`: el chrome global (header/footer) vive en
 * el shell como hermano del `<router-outlet>`, así que medir dentro de `<main>` aísla lo propio de la
 * página del cascarón compartido.
 */
import type { HTMLElement } from 'node-html-parser';

import { validateJsonLd } from './json-ld-validation';
import { parseHtml } from './seo';

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

function normalizedText(element: HTMLElement | null): string {
	return (element?.text ?? '').replace(/\s+/g, ' ').trim();
}

function ngServerContext(root: HTMLElement): Violation | null {
	const actual = root.querySelector('cuentoneta-root')?.getAttribute('ng-server-context');
	if (actual === 'ssr') {
		return null;
	}
	return {
		rule: 'server-render-context',
		message: `Se esperaba ng-server-context="ssr" en <cuentoneta-root>; se encontró "${actual ?? '(ausente)'}" (deopt a CSR).`,
	};
}

function title(root: HTMLElement, pattern?: RegExp): Violation | null {
	const text = root.querySelector('head title')?.text?.trim();
	if (!text) {
		return { rule: 'title', message: 'El <title> está vacío o ausente.' };
	}
	if (pattern && !pattern.test(text)) {
		return { rule: 'title', message: `El <title> "${text}" no matchea ${pattern}.` };
	}
	return null;
}

function canonical(root: HTMLElement, path: string): Violation | null {
	const href = root.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
	if (href?.includes(path)) {
		return null;
	}
	return {
		rule: 'canonical',
		message: `Se esperaba <link rel="canonical"> conteniendo "${path}"; se encontró "${href ?? '(ausente)'}".`,
	};
}

function robotsIndexable(root: HTMLElement): Violation | null {
	const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null;
	if (robots && !/noindex/i.test(robots) && /index/i.test(robots)) {
		return null;
	}
	return {
		rule: 'robots-indexable',
		message: `Se esperaba <meta name="robots"> indexable; se encontró "${robots ?? '(ausente)'}".`,
	};
}

function primaryHeading(root: HTMLElement, pattern?: RegExp): Violation | null {
	const headings = (root.querySelector('main')?.querySelectorAll('h1') ?? [])
		.map((h1) => h1.text.trim())
		.filter((text) => text.length > 0);
	if (headings.length === 0) {
		return { rule: 'primary-heading', message: 'No hay <h1> con texto real dentro de <main>.' };
	}
	// Se descartan las flags g/y: con `.test()` dentro de un `.some()` arrastran `lastIndex` entre h1.
	const matcher = pattern && new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''));
	if (matcher && !headings.some((text) => matcher.test(text))) {
		return {
			rule: 'primary-heading',
			message: `Ningún <h1> dentro de <main> matchea ${pattern}. Encontrados: ${JSON.stringify(headings)}.`,
		};
	}
	return null;
}

function primaryContentLength(
	root: HTMLElement,
	// Umbral por defecto de texto en `<main>`: muy por debajo del contenido real de los fixtures (bio,
	// cuerpo del cuento, ficha técnica) pero muy por encima del ruido de whitespace de un skeleton.
	minLength: number = 120,
): Violation | null {
	const length = normalizedText(root.querySelector('main')).length;
	if (length >= minLength) {
		return null;
	}
	return {
		rule: 'primary-content',
		message: `El texto dentro de <main> tiene ${length} caracteres; se esperaban ≥ ${minLength}.`,
	};
}

function noSkeletonMarkers(root: HTMLElement): Violation | null {
	if (root.querySelector('main [data-testid="skeleton"]')) {
		return {
			rule: 'no-skeleton',
			message:
				'Hay markers de skeleton (data-testid="skeleton") dentro de <main>: el SSR sirve un placeholder de carga.',
		};
	}
	return null;
}

function internalLink(root: HTMLElement, prefix: string): Violation | null {
	const anchors = root.querySelector('main')?.querySelectorAll('a') ?? [];
	if (anchors.some((anchor) => anchor.getAttribute('href')?.startsWith(prefix))) {
		return null;
	}
	return {
		rule: 'internal-link',
		message: `No hay ningún enlace <a> con href que empiece en "${prefix}" dentro de <main>.`,
	};
}

async function jsonLdBlocks(root: HTMLElement, ids: readonly string[]): Promise<Violation[]> {
	const blocks = new Map<string, string>();
	for (const script of root.querySelectorAll('script[data-schema-id]')) {
		const id = script.getAttribute('data-schema-id');
		if (id) {
			blocks.set(id, script.rawText);
		}
	}
	const perId = await Promise.all(ids.map((id) => validateBlock(id, blocks.get(id))));
	return perId.flat();
}

// Presencia + parseabilidad + validez estructural schema.org (via `validateJsonLd`): un bloque que
// existe y parsea pero al que le falta `datePublished`/`author` o trae un `@type` roto ahora viola.
async function validateBlock(id: string, raw: string | undefined): Promise<Violation[]> {
	if (raw === undefined) {
		return [{ rule: 'json-ld', message: `Falta el bloque JSON-LD con data-schema-id="${id}".` }];
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		return [
			{
				rule: 'json-ld',
				message: `No se pudo parsear el bloque JSON-LD "${id}": ${error instanceof Error ? error.message : String(error)}`,
			},
		];
	}
	return validateJsonLd(parsed);
}

// Wrappers públicos: toman `string` (para uso directo desde los specs) y parsean por cuenta propia.
export function checkNgServerContext(html: string): Violation | null {
	return ngServerContext(parseHtml(html));
}

export function checkTitle(html: string, pattern?: RegExp): Violation | null {
	return title(parseHtml(html), pattern);
}

export function checkCanonical(html: string, path: string): Violation | null {
	return canonical(parseHtml(html), path);
}

export function checkRobotsIndexable(html: string): Violation | null {
	return robotsIndexable(parseHtml(html));
}

export function checkPrimaryHeading(html: string, pattern?: RegExp): Violation | null {
	return primaryHeading(parseHtml(html), pattern);
}

export function checkPrimaryContentLength(html: string, minLength?: number): Violation | null {
	return primaryContentLength(parseHtml(html), minLength);
}

export function checkNoSkeletonMarkers(html: string): Violation | null {
	return noSkeletonMarkers(parseHtml(html));
}

export function checkInternalLink(html: string, prefix: string): Violation | null {
	return internalLink(parseHtml(html), prefix);
}

export function checkJsonLdBlocks(html: string, ids: readonly string[]): Promise<Violation[]> {
	return jsonLdBlocks(parseHtml(html), ids);
}

/**
 * Corre todos los checks aplicables sobre un único parse y devuelve TODAS las violaciones (no
 * fail-fast), para que un test rojo reporte de una vez el set completo de invariantes incumplidas.
 * Es async porque la validación estructural de JSON-LD corre `jsonld.expand` (asíncrono).
 */
export async function collectIndexableHtmlViolations(
	html: string,
	expectations: IndexableHtmlExpectations,
): Promise<Violation[]> {
	const root = parseHtml(html);
	const checks: (Violation | null)[] = [
		ngServerContext(root),
		title(root, expectations.titlePattern),
		canonical(root, expectations.canonicalContains ?? expectations.path),
		robotsIndexable(root),
		primaryHeading(root, expectations.h1Pattern),
		primaryContentLength(root, expectations.minPrimaryContentLength),
		noSkeletonMarkers(root),
		expectations.requiredInternalLinkPrefix ? internalLink(root, expectations.requiredInternalLinkPrefix) : null,
	];
	return [
		...checks.filter((violation): violation is Violation => violation !== null),
		...(await jsonLdBlocks(root, expectations.requiredJsonLdIds)),
	];
}
