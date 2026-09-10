// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { elOdioSectionTitle } from './el-odio.epigraph';
import { elOdioRawLiteraryWork } from './el-odio.literary-work.raw.mock';

export const elOdioRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(elOdioRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: elOdioSectionTitle,
			body: 'No empezó por nada. Eso es lo primero que conviene aclarar. No hubo un agravio, ni una herida, ni una infancia que pudiera invocarse después como excusa. El odio estaba ahí desde antes, igual que el peso del cuerpo o el color de los ojos, una propiedad y no un acontecimiento.',
		},
	],
};
