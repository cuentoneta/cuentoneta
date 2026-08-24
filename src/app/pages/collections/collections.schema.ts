import { Location } from '@angular/common';
import { type BreadcrumbList, type CollectionPage, type WithContext } from 'schema-dts';

import { type CollectionTeaser } from '@models/collection.model';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD del catálogo de colecciones. El orden del `ItemList` es el del array que
 * entra: la página ya lo resolvió.
 */
export function buildCollectionCatalogSchema(
	collections: readonly CollectionTeaser[],
	websiteUrl: string,
): WithContext<CollectionPage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Colecciones',
		url: `${baseUrl}/collection`,
		inLanguage: 'es-AR',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: collections.length,
			itemListElement: collections.map((collection, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/collection/${collection.slug}`,
				name: collection.title,
			})),
		},
	};
}

/** Construye el `BreadcrumbList` del catálogo: Inicio → Colecciones. */
export function buildCollectionCatalogBreadcrumb(websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: 'Colecciones', url: `${baseUrl}/collection` },
	]);
}
