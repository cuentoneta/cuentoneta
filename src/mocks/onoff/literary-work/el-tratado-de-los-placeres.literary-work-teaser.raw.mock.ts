// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { ensayoRawTag, filosoficoRawTag, metaficcionRawTag } from '../../onoff-raw-tags.mock';

export const elTratadoDeLosPlaceresRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-el-tratado-de-los-placeres',
	slug: 'el-tratado-de-los-placeres',
	title: 'El tratado de los placeres',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-elTratadoDeLosPlaceresCover-236x328-png' } },
	totalReadingTime: 10,
	sectionCount: 1,
	tags: [ensayoRawTag, filosoficoRawTag, metaficcionRawTag],
	mediaSources: [],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'Conviene advertir, antes de toda enumeración, que un tratado de los placeres no es un repertorio de placeres sino su contrario exacto. Quien escribe _esto_ ya ha dejado de gozar; ha pasado al otro lado de la mesa, donde se mide y se nombra.',
		},
	],
};
