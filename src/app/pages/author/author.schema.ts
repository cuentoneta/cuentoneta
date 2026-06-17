import { Location } from '@angular/common';

import { type Author } from '@models/author.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';
import { type JsonLdSchema } from '../../providers/schema-org.service';

/**
 * Construye el JSON-LD `Person` de la página de un autor: además de nombre/perfil/imagen/`sameAs`,
 * agrega `@context` y, si están disponibles, las fechas de nacimiento y fallecimiento.
 */
export function buildAuthorPersonSchema(author: Author, websiteUrl: string): JsonLdSchema {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	const schema: JsonLdSchema = {
		'@context': 'https://schema.org',
		...buildPersonSchema(author, `${baseUrl}/author/${author.slug}`),
	};
	if (author.bornOn) {
		schema['birthDate'] = author.bornOn;
	}
	if (author.diedOn) {
		schema['deathDate'] = author.diedOn;
	}
	return schema;
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
