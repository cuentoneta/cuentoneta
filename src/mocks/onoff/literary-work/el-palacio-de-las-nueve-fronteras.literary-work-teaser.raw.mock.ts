// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { dramaPsicologicoRawTag, metaficcionRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';
import { palacioNueveFronterasSectionTitle } from './el-palacio-de-las-nueve-fronteras.epigraph';

export const palacioNueveFronterasRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
	slug: 'el-palacio-de-las-nueve-fronteras',
	title: 'El palacio de las nueve fronteras',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' },
	},
	totalReadingTime: 11,
	sectionCount: 1,
	tags: [novelaRawTag, dramaPsicologicoRawTag, metaficcionRawTag],
	mediaSources: [],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			body: 'La primera frontera no tiene nombre porque el nombre se quedó del otro lado, con los que no cruzaron. Avancé al amanecer, cuando la nieve aún no decidía si caer, y el funcionario que revisó mis papeles no levantó la vista. Escribí entonces la primera línea, que no era mía: era de un hombre que había visto caer una hora antes, en una plaza sin testigos, con un orden tan limpio que parecía ensayado.',
		},
	],
};
