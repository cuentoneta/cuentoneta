import type { CollectionBySlugQueryResult } from '@sanity-types';

import { onoffRawLiteraryWorksMock } from '../../onoff-raw-literary-works.mock';

export type RawCollection = NonNullable<CollectionBySlugQueryResult>;
type RawCollectionWork = RawCollection['literaryWorks'][number];
type RawLiteraryWork = (typeof onoffRawLiteraryWorksMock)[number];

// La proyección de la query recorta la obra: se queda con la metadata de tarjeta, achica los autores
// al shape de teaser (sin biografía, recursos ni etiquetas) y trae una sola sección de apertura.
function toCollectionWork(work: RawLiteraryWork): RawCollectionWork {
	return {
		_id: work._id,
		slug: work.slug,
		title: work.title,
		coverImage: work.coverImage,
		totalReadingTime: work.totalReadingTime,
		sectionCount: work.content.length,
		tags: work.tags,
		mediaSources: work.mediaSources,
		authors: work.authors.map(({ _id, slug, name, image, nationality, bornOn, bornOnYear, diedOn, diedOnYear }) => ({
			_id,
			slug,
			name,
			image,
			nationality,
			bornOn,
			bornOnYear,
			diedOn,
			diedOnYear,
		})),
		// La sección se recorta campo por campo y no por spread: la query no proyecta los epígrafes, y
		// copiarlos dejaría la fixture afirmando una forma que el content lake no devuelve.
		teaserSection: work.content.slice(0, 1).map(({ _key, title, body, readingTime }) => ({
			_key,
			title,
			body,
			readingTime,
		})),
	};
}

function workBySlug(slug: string): RawLiteraryWork {
	const work = onoffRawLiteraryWorksMock.find((candidate) => candidate.slug === slug);
	if (!work) {
		throw new Error(`El canon crudo de obras no tiene "${slug}"`);
	}
	return work;
}

// Las obras de una colección se nombran por slug y se proyectan del canon: ninguna se escribe a mano,
// y una colección que nombre una obra inexistente falla al importarse en vez de en un caso suelto.
export function collectionWorks(...slugs: string[]): RawCollectionWork[] {
	return slugs.map((slug) => toCollectionWork(workBySlug(slug)));
}
