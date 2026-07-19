import { Location } from '@angular/common';
import { type BreadcrumbList, type PersonLeaf, type ProfilePage, type WithContext } from 'schema-dts';

import { type Author, type AuthorProfile } from '@models/author.model';
import { type TextBlockContent } from '@models/block-content.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';

/**
 * Aplana y recorta la biografía (PortableText) a texto plano para el `description` del Person, recortado
 * en el último espacio antes del tope. Da al `Person`/`ProfilePage` texto para resultados enriquecidos
 * para AEO/SEO en la información expuesta en JSON-LD, independiente de la biografía visible para el
 * crawler en HTML
 */
function buildBiographyDescription(biography: TextBlockContent[]): string | undefined {
	const maxLength = 300;
	const plainText = biography
		.map((block) => block.children.map((child) => child.text).join(''))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
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
