import { Location } from '@angular/common';
import { type BreadcrumbList, type CollectionPage, type WithContext } from 'schema-dts';

import { type LiteraryWorkTeaser } from '@models/literary-work.model';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD del catálogo de obras. El orden del `ItemList` es el del array que entra: la
 * página ya lo resolvió. Cada elemento apunta a la lectura y no al catálogo, porque el catálogo y el
 * detalle viven en rutas distintas.
 */
export function buildLiteraryWorkCatalogSchema(
	literaryWorks: readonly LiteraryWorkTeaser[],
	websiteUrl: string,
): WithContext<CollectionPage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Obras',
		url: `${baseUrl}/literary-work`,
		inLanguage: 'es-AR',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: literaryWorks.length,
			itemListElement: literaryWorks.map((literaryWork, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/literary-work/${literaryWork.slug}`,
				name: literaryWork.title,
			})),
		},
	};
}

/** Construye el `BreadcrumbList` del catálogo: Inicio → Obras. */
export function buildLiteraryWorkCatalogBreadcrumb(websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: 'Obras', url: `${baseUrl}/literary-work` },
	]);
}
