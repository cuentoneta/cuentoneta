import { Location } from '@angular/common';

import { type Author, type AuthorProfile } from '@models/author.model';
import { type TextBlockContent } from '@models/block-content.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';
import { type JsonLdSchema } from '../../providers/schema-org.service';

/**
 * Aplana la biografía (PortableText) a texto plano para el `description` del Person, recortado en el
 * último espacio antes del tope. Da al `Person`/`ProfilePage` una señal de "aboutness" para AEO/rich
 * results, independiente de que la bio quede en un tab oculto por CSS en la página.
 */
function buildBiographyDescription(biography: TextBlockContent[]): string | undefined {
	// Tope del `description`: un resumen citable, no la biografía entera volcada al JSON-LD.
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
export function buildAuthorProfilePageSchema(author: AuthorProfile, websiteUrl: string): JsonLdSchema {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	const authorUrl = `${baseUrl}/author/${author.slug}`;
	const person = buildPersonSchema(author, authorUrl);
	const description = buildBiographyDescription(author.biography);
	if (description) {
		person['description'] = description;
	}
	if (author.bornOn) {
		person['birthDate'] = author.bornOn;
	}
	if (author.diedOn) {
		person['deathDate'] = author.diedOn;
	}
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
export function buildAuthorBreadcrumb(author: Author, websiteUrl: string): JsonLdSchema {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: 'Autores', url: `${baseUrl}/authors` },
		{ name: author.name, url: `${baseUrl}/author/${author.slug}` },
	]);
}
