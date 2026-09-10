// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { lasDosAntorchasRawLiteraryWork } from './las-dos-antorchas.literary-work.raw.mock';

export const lasDosAntorchasRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(lasDosAntorchasRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'El corredor no tenía principio que alguien recordara. Avanzábamos por él como se avanza en un cálculo: sin esperanza de llegada, atentos sólo a no perder el hilo. Dos antorchas iban con nosotros, una a cada lado, y desde el primer paso comprendí que nunca alumbrarían lo mismo.',
		},
	],
};
