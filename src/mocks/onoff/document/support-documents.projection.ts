import type { Nationality, ResourceType, Tag } from '@sanity-types';
import { onoffRawTagsMock, type RawTag } from '../../onoff-raw-tags.mock';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { documentReference, documentSystemFields, slugField } from './sanity-document.factory';

// Los documentos que las queries dereferencian pero que ninguna entidad "posee": cada uno vive en su
// propio documento de Sanity y varias entidades los referencian. Se derivan del canon crudo invirtiendo
// la proyección que la query les aplica — el raw no transporta su `_id`, así que se deriva del slug.

type RawResourceType = NonNullable<typeof rawOnoffAuthor.resources>[number]['resourceType'];

export function tagDocumentId(slug: string): string {
	return `tag-${slug}`;
}

export function toTagDocument(raw: RawTag): Tag {
	return {
		...documentSystemFields(tagDocumentId(raw.slug)),
		_type: 'tag',
		title: raw.title,
		slug: slugField(raw.slug),
		description: raw.description,
	};
}

export function tagReference(raw: RawTag, key?: string) {
	return documentReference(tagDocumentId(raw.slug), key);
}

export function resourceTypeDocumentId(slug: string): string {
	return `resource-type-${slug}`;
}

export function toResourceTypeDocument(raw: RawResourceType): ResourceType {
	return {
		...documentSystemFields(resourceTypeDocumentId(raw.slug)),
		_type: 'resourceType',
		title: raw.title,
		slug: slugField(raw.slug),
		description: raw.description,
	};
}

// La nacionalidad es el único caso en que el raw ya transporta el documento entero: la query la
// dereferencia sin proyectar (`nationality->`), así que acá la inversión es la identidad.
export function toNationalityDocument(raw: typeof rawOnoffAuthor.nationality): Nationality {
	return raw;
}

export const onoffTagDocumentsMock: Tag[] = onoffRawTagsMock.map(toTagDocument);

export const onoffResourceTypeDocumentsMock: ResourceType[] = (rawOnoffAuthor.resources ?? []).map((resource) =>
	toResourceTypeDocument(resource.resourceType),
);

export const onoffNationalityDocumentsMock: Nationality[] = [toNationalityDocument(rawOnoffAuthor.nationality)];
