import { type Author } from '@models/author.model';
import { type JsonLdSchema } from '../providers/schema-org.service';

/** Ítem de un breadcrumb: etiqueta visible y URL absoluta de la página. */
export interface BreadcrumbItem {
	name: string;
	url: string;
}

/**
 * Construye un `Person` (sin `@context`, pensado para anidar) a partir de un autor:
 * nombre, URL de su perfil, imagen y `sameAs` con sus recursos web.
 */
export function buildPersonSchema(author: Author, authorUrl: string): JsonLdSchema {
	const person: JsonLdSchema = {
		'@type': 'Person',
		name: author.name,
		url: authorUrl,
	};
	if (author.imageUrl) {
		person['image'] = author.imageUrl;
	}
	const sameAs = author.resources.map((resource) => resource.url).filter((url) => url.length > 0);
	if (sameAs.length > 0) {
		person['sameAs'] = sameAs;
	}
	return person;
}

/** Construye un `BreadcrumbList` a partir de una lista ordenada de ítems (home → … → página actual). */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}
