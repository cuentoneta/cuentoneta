import { Location } from '@angular/common';

import { type Author } from '@models/author.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';
import { type JsonLdSchema } from '../../providers/schema-org.service';

/**
 * Construye el JSON-LD `ProfilePage` de la página de un autor. Como `Person` no es un `CreativeWork`,
 * las fechas de la ficha (`dateCreated`/`dateModified`) no son válidas sobre el `Person`; se declaran
 * en el `ProfilePage` que lo envuelve como `mainEntity`. Las fechas de vida van en el `Person`.
 */
export function buildAuthorProfilePageSchema(author: Author, websiteUrl: string): JsonLdSchema {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	const person = buildPersonSchema(author, `${baseUrl}/author/${author.slug}`);
	if (author.bornOn) {
		person['birthDate'] = author.bornOn;
	}
	if (author.diedOn) {
		person['deathDate'] = author.diedOn;
	}
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
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
