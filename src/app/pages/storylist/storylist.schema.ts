import { Location } from '@angular/common';
import { type BreadcrumbList, type CollectionPage, type WithContext } from 'schema-dts';

import { type Storylist } from '@models/storylist.model';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD `CollectionPage` de una storylist, con un `ItemList` ordenado de los
 * cuentos que la integran (posición + URL + título), para que los answer engines entiendan la colección.
 */
export function buildStorylistCollectionSchema(storylist: Storylist, websiteUrl: string): WithContext<CollectionPage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: storylist.title,
		url: `${baseUrl}/storylist/${storylist.slug}`,
		inLanguage: 'es-AR',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: storylist.stories.length,
			itemListElement: storylist.stories.map((story, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/story/${story.slug}`,
				name: story.title,
			})),
		},
	};
}

/** Construye el `BreadcrumbList` de la página de una storylist: Inicio → storylist. */
export function buildStorylistBreadcrumb(storylist: Storylist, websiteUrl: string): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: storylist.title, url: `${baseUrl}/storylist/${storylist.slug}` },
	]);
}
