import type { Collection } from '@sanity-types';
import { onoffRawCollectionsMock } from '../../onoff-raw-collections.mock';
import { documentReference, documentSystemFields, slugField } from '../document/sanity-document.factory';
import { tagDocumentId } from '../document/support-documents.projection';

type RawCollection = (typeof onoffRawCollectionsMock)[number];

// La query dereferencia `literaryWorks[]->` y proyecta cada obra; el documento solo guarda la
// referencia. El `_id` de cada obra sí viaja en el raw, así que la referencia se reconstruye desde ahí.
export function toCollectionDocument(raw: RawCollection): Collection {
	return {
		...documentSystemFields(raw._id),
		_type: 'collection',
		title: raw.title,
		slug: slugField(raw.slug),
		description: raw.description,
		...(raw.featuredImage ? { featuredImage: raw.featuredImage } : {}),
		config: { showAuthors: raw.config.showAuthors },
		literaryWorks: raw.literaryWorks.map((work) => ({ _key: work._id, ...documentReference(work._id) })),
		tags: raw.tags.map((tag) => ({ _key: tag.slug, ...documentReference(tagDocumentId(tag.slug)) })),
		mediaSources: raw.mediaSources,
	};
}

export const onoffCollectionDocumentsMock: Collection[] = onoffRawCollectionsMock.map(toCollectionDocument);
