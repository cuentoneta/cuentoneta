// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { literaryWorkTeaserFrom } from '../derive-raw';
import { palacioNueveFronterasSectionTitle } from './el-palacio-de-las-nueve-fronteras.epigraph';
import { palacioNueveFronterasRawLiteraryWork } from './el-palacio-de-las-nueve-fronteras.literary-work.raw.mock';

export const palacioNueveFronterasRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	...literaryWorkTeaserFrom(palacioNueveFronterasRawLiteraryWork),
	excerpt: [
		{
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			body: 'La primera frontera no tiene nombre porque el nombre se quedó del otro lado, con los que no cruzaron. Avancé al amanecer, cuando la nieve aún no decidía si caer, y el funcionario que revisó mis papeles no levantó la vista. Escribí entonces la primera línea, que no era mía: era de un hombre que había visto caer una hora antes, en una plaza sin testigos, con un orden tan limpio que parecía ensayado.',
		},
	],
};
