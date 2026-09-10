// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { colaborativaRawTag } from '../../onoff-raw-tags.mock';
import { elOdioRawLiteraryWorkTeaser } from '../literary-work/el-odio.literary-work-teaser.raw.mock';
import { elTratadoDeLosPlaceresRawLiteraryWorkTeaser } from '../literary-work/el-tratado-de-los-placeres.literary-work-teaser.raw.mock';
import { lasDosAntorchasRawLiteraryWorkTeaser } from '../literary-work/las-dos-antorchas.literary-work-teaser.raw.mock';
import inventarioDeLasPasionesCollectionMd from './inventario-de-las-pasiones.collection.md?raw';

export const inventarioDeLasPasionesRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: inventarioDeLasPasionesCollectionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [colaborativaRawTag],
	mediaSources: [],
	literaryWorks: [
		elTratadoDeLosPlaceresRawLiteraryWorkTeaser,
		elOdioRawLiteraryWorkTeaser,
		lasDosAntorchasRawLiteraryWorkTeaser,
	],
};
