/**
 * Helpers puros del smoke de indexado (sin I/O): parseo del sitemap, muestreo y derivación de las
 * expectations por tipo de página. Separados de `seo-smoke.ts` (orquestación/red) para poder testearlos
 * sin levantar un server ni tocar la red.
 */
import type { IndexableHtmlExpectations } from '../e2e/_utils/seo-invariants';
import { parseHtml } from '../e2e/_utils/seo';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../e2e/_utils/seo-fixtures';

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
