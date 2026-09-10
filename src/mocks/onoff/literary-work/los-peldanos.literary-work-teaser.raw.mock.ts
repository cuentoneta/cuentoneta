// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { absurdoRawTag, cuentoRawTag, surrealismoRawTag } from '../../onoff-raw-tags.mock';

export const losPeldanosRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-los-peldanos',
	slug: 'los-peldanos',
	title: 'Los peldaños',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
	totalReadingTime: 8,
	sectionCount: 1,
	tags: [cuentoRawTag, absurdoRawTag, surrealismoRawTag],
	mediaSources: [],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'La escalera empezaba en ninguna parte y terminaba un poco más arriba de eso. La Sra. Oneiras vivía en alguno de sus peldaños, aunque jamás conseguí determinar en cuál, porque cada vez que creía haberlo hecho el peldaño se desplazaba, o yo me desplazaba, o el día entero cambiaba de número sin avisarle a nadie.',
		},
	],
};
