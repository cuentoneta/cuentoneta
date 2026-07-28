import { type BreadcrumbList, type PersonLeaf, type WithContext } from 'schema-dts';

import { type Author } from '@models/author.model';

/** Ítem de un breadcrumb: etiqueta visible y URL absoluta de la página. */
export interface BreadcrumbItem {
	name: string;
	url: string;
}

/**
 * Construye un `Person` (sin `@context`, pensado para anidar) a partir de un autor:
 * nombre, URL de su perfil, imagen y `sameAs` con sus recursos web.
 */
export function buildPersonSchema(author: Author, authorUrl: string): PersonLeaf {
	const sameAs = author.resources.map((resource) => resource.url).filter((url) => url.length > 0);
	return {
		'@type': 'Person',
		name: author.name,
		url: authorUrl,
		...(author.imageUrl ? { image: author.imageUrl } : {}),
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}

/**
 * Construye un `BreadcrumbList` a partir de una lista ordenada de ítems (home → … → página actual).
 *
 * Cada `ListItem.item` se emite como `IdReference` (`{ '@id': url }`): schema.org tipa `item` como
 * `Thing`, no como URL suelta, y esta forma —aceptada por Google— mantiene el builder type-safe con
 * `schema-dts` sin castear.
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): WithContext<BreadcrumbList> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: { '@id': item.url },
		})),
	};
}
