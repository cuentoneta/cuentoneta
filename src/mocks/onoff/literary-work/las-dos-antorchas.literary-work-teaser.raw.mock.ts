// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { experimentalRawTag, metaficcionRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';

export const lasDosAntorchasRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-las-dos-antorchas',
	slug: 'las-dos-antorchas',
	title: 'Las dos antorchas',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
	totalReadingTime: 8,
	sectionCount: 1,
	tags: [novelaRawTag, metaficcionRawTag, experimentalRawTag],
	mediaSources: [],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'El corredor no tenía principio que alguien recordara. Avanzábamos por él como se avanza en un cálculo: sin esperanza de llegada, atentos sólo a no perder el hilo. Dos antorchas iban con nosotros, una a cada lado, y desde el primer paso comprendí que nunca alumbrarían lo mismo.',
		},
	],
};
