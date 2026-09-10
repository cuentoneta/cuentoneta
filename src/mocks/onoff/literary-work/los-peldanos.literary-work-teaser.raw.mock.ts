// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { losPeldanosRawLiteraryWork } from './los-peldanos.literary-work.raw.mock';

export const losPeldanosRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(losPeldanosRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'La escalera empezaba en ninguna parte y terminaba un poco más arriba de eso. La Sra. Oneiras vivía en alguno de sus peldaños, aunque jamás conseguí determinar en cuál, porque cada vez que creía haberlo hecho el peldaño se desplazaba, o yo me desplazaba, o el día entero cambiaba de número sin avisarle a nadie.',
		},
	],
};
