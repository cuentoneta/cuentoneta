import { onoffImageAssets } from './onoff-image-assets.mock';
import type { AuthorsQueryResult, CollectionBySlugQueryResult, LiteraryWorkBySlugQueryResult } from '@sanity-types';
import onoffBiographyMdBody from './onoff/author/francois-onoff.biography.md?raw';

export const rawOnoffAuthor: NonNullable<LiteraryWorkBySlugQueryResult>['authors'][number] = {
	_id: 'author_1',
	slug: 'francois-onoff',
	name: 'François Onoff',
	image: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.francoisOnoffPortrait.ref },
	},
	nationality: {
		_id: 'nationality-francia',
		_type: 'nationality',
		_createdAt: '2021-12-28T00:00:00Z',
		_updatedAt: '2021-12-28T00:00:00Z',
		_rev: 'rev-francia',
		country: 'Francia',
		flag: {
			_type: 'image',
			asset: { _type: 'reference', _ref: onoffImageAssets.franceFlag.ref },
		},
	},
	biography: onoffBiographyMdBody,
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
	resources: [
		{
			title: 'Artículo de François Onoff en Wikipedia',
			url: 'https://es.wikipedia.org/wiki/Francois_Onoff',
			resourceType: {
				slug: 'wikipedia',
				title: 'Wikipedia',
				description: 'Enlace a artículo de Wikipedia',
			},
		},
	],
	tags: [],
};

// Las caras angostas leen sus valores de la completa, así que no pueden divergir en lo que comparten.
// Qué campos trae cada una lo decide su query, y el tipo de cada handle denuncia si alguna se aparta.
const authorTeaserFields = {
	_id: rawOnoffAuthor._id,
	slug: rawOnoffAuthor.slug,
	name: rawOnoffAuthor.name,
	image: rawOnoffAuthor.image,
	nationality: rawOnoffAuthor.nationality,
	bornOn: rawOnoffAuthor.bornOn,
	bornOnYear: rawOnoffAuthor.bornOnYear,
	diedOn: rawOnoffAuthor.diedOn,
	diedOnYear: rawOnoffAuthor.diedOnYear,
};

/** Lo que devuelve `authorsQuery`, que proyecta un `resources` siempre vacío. */
export const rawOnoffAuthorTeaser: AuthorsQueryResult[number] = { ...authorTeaserFields, resources: [] };

/**
 * El autor tal como lo embeben las obras de un listado: la colección, la página de inicio, el contenido
 * rotativo y el listado de obras proyectan estos mismos campos, sin `resources`.
 */
export const rawOnoffEmbeddedAuthor: NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['authors'][number] =
	authorTeaserFields;
