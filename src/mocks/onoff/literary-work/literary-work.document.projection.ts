import type { LiteraryWork, SanityFileAsset } from '@sanity-types';
import { onoffRawLiteraryWorksMock } from '../../onoff-raw-literary-works.mock';
import {
	createAudioAssetDocument,
	documentReference,
	documentSystemFields,
	slugField,
	withoutKey,
} from '../document/sanity-document.factory';
import { resourceTypeDocumentId, tagReference } from '../document/support-documents.projection';

type RawLiteraryWork = (typeof onoffRawLiteraryWorksMock)[number];
type RawMediaSource = NonNullable<RawLiteraryWork['mediaSources']>[number];
type DocumentMediaSource = NonNullable<LiteraryWork['mediaSources']>[number];

function toDocumentMediaSource(raw: RawMediaSource): DocumentMediaSource {
	return 'audioUrl' in raw ? withoutKey(raw, 'audioUrl') : raw;
}

// El raw transporta la url del audio ya resuelta, así que el documento de asset se puede reconstruir:
// sin él en el dataset, `asset->url` resolvería a null en silencio.
function assetDocumentsOf(raw: RawLiteraryWork): SanityFileAsset[] {
	return (raw.mediaSources ?? []).flatMap((source) => {
		if (!('audioFile' in source) || !('audioUrl' in source)) {
			return [];
		}
		const ref = source.audioFile?.asset?._ref;
		return ref && source.audioUrl ? [createAudioAssetDocument({ ref, url: source.audioUrl })] : [];
	});
}

export function toLiteraryWorkDocument(raw: RawLiteraryWork): LiteraryWork {
	return {
		...documentSystemFields(raw._id),
		_type: 'literaryWork',
		title: raw.title,
		slug: slugField(raw.slug),
		authors: raw.authors.map((author) => ({ _key: author._id, ...documentReference(author._id) })),
		...(raw.coverImage ? { coverImage: raw.coverImage } : {}),
		content: raw.content.map((section) => ({
			_type: 'section' as const,
			_key: section._key,
			...(section.title ? { title: section.title } : {}),
			...(section.epigraphs.length > 0
				? {
						epigraphs: section.epigraphs.map((epigraph, index) => ({
							_type: 'epigraph' as const,
							_key: `epigraph-${index}`,
							...(epigraph.text ? { text: epigraph.text } : {}),
							...(epigraph.reference ? { reference: epigraph.reference } : {}),
						})),
					}
				: {}),
			body: section.body,
			...(section.readingTime !== null ? { readingTime: section.readingTime } : {}),
		})),
		...(raw.editorialNote ? { editorialNote: raw.editorialNote } : {}),
		...(raw.totalReadingTime !== null ? { totalReadingTime: raw.totalReadingTime } : {}),
		mediaSources: (raw.mediaSources ?? []).map(toDocumentMediaSource),
		resources: raw.resources.map((resource, index) => ({
			_type: 'resource' as const,
			_key: `resource-${index}`,
			title: resource.title,
			url: resource.url,
			resourceType: documentReference(resourceTypeDocumentId(resource.resourceType.slug)),
		})),
		tags: raw.tags.map((tag) => tagReference(tag.slug)),
		badLanguage: raw.badLanguage,
		originalPublication: raw.originalPublication,
		publishedAt: raw.publishedAt,
	};
}

export const onoffLiteraryWorkDocumentsMock: LiteraryWork[] = onoffRawLiteraryWorksMock.map(toLiteraryWorkDocument);

export const onoffLiteraryWorkAssetDocumentsMock: SanityFileAsset[] =
	onoffRawLiteraryWorksMock.flatMap(assetDocumentsOf);
