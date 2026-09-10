// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { neronRawLiteraryWork } from './neron.literary-work.raw.mock';

export const neronRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(neronRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'Escribí Nerón porque creí, durante algunos meses, que el incendio podía contarse desde adentro. Me equivoqué con método y precisión, que son las dos únicas formas decentes de equivocarse.',
		},
	],
};
