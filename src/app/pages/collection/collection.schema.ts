import { Location } from '@angular/common';
import { type BreadcrumbList, type CollectionPage, type WithContext } from 'schema-dts';

import { type Collection } from '@models/collection.model';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD `CollectionPage` de una colección, con un `ItemList` ordenado de las obras
 * que la integran (posición + URL + título), para que los answer engines entiendan la colección.
 *
 * Los ítems apuntan a `/read/:slug`, que es a donde enlaza el listado de la página.
 */
export function buildCollectionPageSchema(collection: Collection, websiteUrl: string): WithContext<CollectionPage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: collection.title,
		url: `${baseUrl}/collection/${collection.slug}`,
		inLanguage: 'es-AR',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: collection.count,
			itemListElement: collection.literaryWorks.map((literaryWork, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/read/${literaryWork.slug}`,
				name: literaryWork.title,
			})),
		},
	};
}

/** Construye el `BreadcrumbList` de la página de una colección: Inicio → colección. */
export function buildCollectionBreadcrumb(collection: Collection, websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: collection.title, url: `${baseUrl}/collection/${collection.slug}` },
	]);
}
