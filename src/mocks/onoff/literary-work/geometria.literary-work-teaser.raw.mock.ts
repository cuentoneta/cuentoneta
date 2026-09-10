// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { geometriaSectionTitle } from './geometria.epigraph';
import { geometriaRawLiteraryWork } from './geometria.literary-work.raw.mock';

export const geometriaRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(geometriaRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: geometriaSectionTitle,
			body: 'A las tres y media en punto, sin que ningún despertador lo convoque, Shannon abre los ojos. La oscuridad de la habitación tiene siempre el mismo peso, el mismo gramaje exacto, como si la noche hubiera sido recortada con escuadra. No hay sobresalto: hay precisión.',
		},
	],
};
