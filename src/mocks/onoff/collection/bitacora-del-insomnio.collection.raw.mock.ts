// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { elOdioRawLiteraryWorkTeaser } from '../literary-work/el-odio.literary-work-teaser.raw.mock';
import { palacioNueveFronterasRawLiteraryWorkTeaser } from '../literary-work/el-palacio-de-las-nueve-fronteras.literary-work-teaser.raw.mock';
import { geometriaRawLiteraryWorkTeaser } from '../literary-work/geometria.literary-work-teaser.raw.mock';
import bitacoraDelInsomnioCollectionMd from './bitacora-del-insomnio.collection.md?raw';

export const bitacoraDelInsomnioRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-bitacora-del-insomnio',
	slug: 'bitacora-del-insomnio',
	title: 'Bitácora del insomnio',
	description: bitacoraDelInsomnioCollectionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [],
	mediaSources: [],
	literaryWorks: [
		geometriaRawLiteraryWorkTeaser,
		elOdioRawLiteraryWorkTeaser,
		palacioNueveFronterasRawLiteraryWorkTeaser,
	],
};
