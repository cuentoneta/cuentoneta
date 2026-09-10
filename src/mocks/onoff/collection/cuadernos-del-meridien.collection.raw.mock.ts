// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { colaborativaRawTag, ensayoRawTag, metaficcionRawTag } from '../../onoff-raw-tags.mock';
import { palacioNueveFronterasRawLiteraryWorkTeaser } from '../literary-work/el-palacio-de-las-nueve-fronteras.literary-work-teaser.raw.mock';
import { elTratadoDeLosPlaceresRawLiteraryWorkTeaser } from '../literary-work/el-tratado-de-los-placeres.literary-work-teaser.raw.mock';
import { lasEscalerasRawLiteraryWorkTeaser } from '../literary-work/las-escaleras.literary-work-teaser.raw.mock';
import cuadernosDelMeridienCollectionMd from './cuadernos-del-meridien.collection.md?raw';

export const cuadernosDelMeridienRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-cuadernos-del-meridien',
	slug: 'cuadernos-del-meridien',
	title: 'Cuadernos del Méridien: los años de taller y las obras corregidas a posteriori',
	description: cuadernosDelMeridienCollectionMd,
	featuredImage: null,
	config: { showAuthors: true },
	tags: [colaborativaRawTag, ensayoRawTag, metaficcionRawTag],
	mediaSources: [],
	literaryWorks: [
		palacioNueveFronterasRawLiteraryWorkTeaser,
		elTratadoDeLosPlaceresRawLiteraryWorkTeaser,
		lasEscalerasRawLiteraryWorkTeaser,
	],
};
