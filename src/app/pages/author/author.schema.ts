import { Location } from '@angular/common';
import { type BreadcrumbList, type PersonLeaf, type ProfilePage, type WithContext } from 'schema-dts';

import { type Author, type AuthorProfile } from '@models/author.model';
import { type SanitizedHtml } from '@models/sanitized-html.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';

// Tags que separan texto: al desaparecer dejan un espacio, o la última palabra de un bloque quedaría
// pegada a la primera del siguiente. Los inline (`em`, `strong`, `a`, `code`) se quitan sin espacio,
// porque abren y cierran dentro de la oración y un espacio ahí despega la puntuación que los sigue.
const BLOCK_LEVEL_TAG = /<\/?(?:p|div|br|hr|h[1-6]|ul|ol|li|blockquote|pre|figure|figcaption|table|tr|td|th)\b[^>]*>/gi;

// El pipeline emite referencias **numéricas** (`rehype-stringify` no usa referencias con nombre), pero
// se aceptan las dos formas para no depender de esa configuración. Una única pasada, no una por
// entidad: así `&amp;#x26;` se resuelve a `&#x26;` y no se decodifica dos veces hasta `&`.
const HTML_REFERENCE = /&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|(amp|lt|gt|quot|apos));/g;

const NAMED_REFERENCES: Readonly<Record<string, string>> = Object.freeze({
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
});

function decodeReferences(text: string): string {
	return text.replace(HTML_REFERENCE, (match, hex?: string, decimal?: string, name?: string) => {
		if (hex !== undefined) return String.fromCodePoint(Number.parseInt(hex, 16));
		if (decimal !== undefined) return String.fromCodePoint(Number.parseInt(decimal, 10));
		return name !== undefined ? (NAMED_REFERENCES[name] ?? match) : match;
	});
}

// Reduce el HTML saneado a texto plano. No usa `DOMParser`: esto corre también en el SSR de Node, donde
// no existe. Las referencias se decodifican después de quitar los tags, para que un `<` del texto no se
// reinterprete como marcado.
function toPlainText(html: SanitizedHtml): string {
	const withoutTags = html.replace(BLOCK_LEVEL_TAG, ' ').replace(/<[^>]*>/g, '');
	return decodeReferences(withoutTags).replace(/\s+/g, ' ').trim();
}

/**
 * Aplana y recorta la biografía a texto plano para el `description` del Person, recortado en el último
 * espacio antes del tope. Da al `Person`/`ProfilePage` texto para resultados enriquecidos para AEO/SEO
 * en la información expuesta en JSON-LD, independiente de la biografía visible para el crawler en HTML
 */
function buildBiographyDescription(biography: SanitizedHtml): string | undefined {
	const maxLength = 300;
	const plainText = toPlainText(biography);
	if (!plainText) {
		return undefined;
	}
	if (plainText.length <= maxLength) {
		return plainText;
	}
	const truncated = plainText.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}

/**
 * Construye el JSON-LD `ProfilePage` de la página de un autor. Como `Person` no es un `CreativeWork`,
 * las fechas de la ficha (`dateCreated`/`dateModified`) no son válidas sobre el `Person`; se declaran
 * en el `ProfilePage` que lo envuelve como `mainEntity`. Las fechas de vida van en el `Person`.
 */
export function buildAuthorProfilePageSchema(author: AuthorProfile, websiteUrl: string): WithContext<ProfilePage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	const authorUrl = `${baseUrl}/author/${author.slug}`;
	const description = buildBiographyDescription(author.biography);
	const person: PersonLeaf = {
		...buildPersonSchema(author, authorUrl),
		...(description ? { description } : {}),
		...(author.bornOn ? { birthDate: author.bornOn } : {}),
		...(author.diedOn ? { deathDate: author.diedOn } : {}),
	};
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: authorUrl,
		dateCreated: author.createdAt,
		dateModified: author.updatedAt,
		mainEntity: person,
	};
}

/** Construye el `BreadcrumbList` de la página de un autor: Inicio → Autores → autor. */
export function buildAuthorBreadcrumb(author: Author, websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: 'Autores', url: `${baseUrl}/authors` },
		{ name: author.name, url: `${baseUrl}/author/${author.slug}` },
	]);
}
