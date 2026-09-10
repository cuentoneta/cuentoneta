// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { elTratadoDeLosPlaceresRawLiteraryWork } from './el-tratado-de-los-placeres.literary-work.raw.mock';

export const elTratadoDeLosPlaceresRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(elTratadoDeLosPlaceresRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'Conviene advertir, antes de toda enumeración, que un tratado de los placeres no es un repertorio de placeres sino su contrario exacto. Quien escribe _esto_ ya ha dejado de gozar; ha pasado al otro lado de la mesa, donde se mide y se nombra.',
		},
	],
};
