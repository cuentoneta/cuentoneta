import { Location } from '@angular/common';
import { type BreadcrumbList, type CollectionPage, type WithContext } from 'schema-dts';

import { type Collection } from '@models/collection.model';
import { type SanitizedHtml } from '@models/sanitized-html.model';
import { htmlToPlainText } from '@utils/html-to-text.utils';
import { buildBreadcrumbSchema } from '@utils/schema-org.builders';

/**
 * Deriva la descripción de indexado de una colección desde su prosa: texto plano recortado en el
 * último espacio antes del tope, para que el corte no parta palabras. Devuelve `undefined` cuando el
 * HTML no trae prosa, y ahí cada señal decide su reemplazo.
 */
export function buildCollectionDescription(description: SanitizedHtml): string | undefined {
	const maxLength = 300;
	const plainText = htmlToPlainText(description);
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
 * Construye el JSON-LD `CollectionPage` de una colección, con un `ItemList` ordenado de las obras
 * que la integran (posición + URL + título), para que los answer engines entiendan la colección.
 *
 * Los ítems apuntan a `/literary-work/:slug`, que es a donde enlaza el listado de la página.
 */
export function buildCollectionPageSchema(collection: Collection, websiteUrl: string): WithContext<CollectionPage> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	const description = buildCollectionDescription(collection.description);
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: collection.title,
		url: `${baseUrl}/collection/${collection.slug}`,
		inLanguage: 'es-AR',
		...(description ? { description } : {}),
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: collection.count,
			itemListElement: collection.literaryWorks.map((literaryWork, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${baseUrl}/literary-work/${literaryWork.slug}`,
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
