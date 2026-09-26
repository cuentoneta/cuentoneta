// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { lasEscalerasRawLiteraryWork } from './las-escaleras.literary-work.raw.mock';

export const lasEscalerasRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(lasEscalerasRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'Dos años después la encontré donde la había dejado, al pie de la escalera, midiendo con el pulgar la distancia exacta que separaba un peldaño del siguiente. La Sra. Oneiras no había envejecido; se había vuelto más precisa, como una cifra que se repite hasta perder su sentido.',
		},
	],
};
