import { Location } from '@angular/common';
import { type BreadcrumbList, type CollectionPage, type WithContext } from 'schema-dts';

import { type AuthorTeaser } from '@models/author.model';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD del índice de autores. El orden del `ItemList` es el del array que entra: la
 * página ya lo resolvió. El nombre va recortado porque hay fichas que lo guardan con espacios en los
 * bordes, y en el JSON-LD no colapsan como en el HTML.
 */
export function buildAuthorCatalogSchema(
	authors: readonly AuthorTeaser[],
	websiteUrl: string,
): WithContext<CollectionPage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Autores',
		url: `${baseUrl}/authors`,
		inLanguage: 'es-AR',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: authors.length,
			itemListElement: authors.map((author, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/author/${author.slug}`,
				name: author.name.trim(),
			})),
		},
	};
}

/** Construye el `BreadcrumbList` del índice: Inicio → Autores. */
export function buildAuthorCatalogBreadcrumb(websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: 'Autores', url: `${baseUrl}/authors` },
	]);
}
