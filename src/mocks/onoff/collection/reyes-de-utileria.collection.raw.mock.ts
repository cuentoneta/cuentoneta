// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { teatroRawTag, tragediaRawTag } from '../../onoff-raw-tags.mock';
import { palacioNueveFronterasRawLiteraryWorkTeaser } from '../literary-work/el-palacio-de-las-nueve-fronteras.literary-work-teaser.raw.mock';
import { losPeldanosRawLiteraryWorkTeaser } from '../literary-work/los-peldanos.literary-work-teaser.raw.mock';
import { neronRawLiteraryWorkTeaser } from '../literary-work/neron.literary-work-teaser.raw.mock';
import reyesDeUtileriaCollectionMd from './reyes-de-utileria.collection.md?raw';

export const reyesDeUtileriaRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-reyes-de-utileria',
	slug: 'reyes-de-utileria',
	title: 'Reyes de utilería',
	description: reyesDeUtileriaCollectionMd,
	featuredImage: null,
	config: { showAuthors: true },
	tags: [teatroRawTag, tragediaRawTag],
	mediaSources: [],
	literaryWorks: [
		neronRawLiteraryWorkTeaser,
		palacioNueveFronterasRawLiteraryWorkTeaser,
		losPeldanosRawLiteraryWorkTeaser,
	],
};
