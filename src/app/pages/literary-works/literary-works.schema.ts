import { Location } from '@angular/common';
import type { BreadcrumbList, CollectionPage, WithContext } from 'schema-dts';

import type { LiteraryWorkCatalogEntry } from '@models/literary-work.model';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD del catálogo de obras. El orden del `ItemList` es el del array que entra, que es
 * el que sirve el catálogo (por slug). Cada elemento apunta a la lectura y no al catálogo, porque el
 * catálogo y el detalle viven en rutas distintas.
 */
export function buildLiteraryWorkCatalogSchema(
	entries: readonly LiteraryWorkCatalogEntry[],
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
			numberOfItems: entries.length,
			itemListElement: entries.map((entry, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/literary-work/${entry.slug}`,
				name: entry.title,
			})),
		},
	};
}

/** Construye el `BreadcrumbList` del catálogo: Inicio → Obras. */
export function buildLiteraryWorkCatalogBreadcrumb(websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/` },
		{ name: 'Obras', url: `${baseUrl}/literary-work` },
	]);
}
