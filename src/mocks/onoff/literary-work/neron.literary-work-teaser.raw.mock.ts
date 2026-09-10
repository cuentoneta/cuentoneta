// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { dramaHistoricoRawTag, teatroRawTag, tragediaRawTag } from '../../onoff-raw-tags.mock';

export const neronRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-neron',
	slug: 'neron',
	title: 'Nerón',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-neronCover-236x328-png' } },
	totalReadingTime: 7,
	sectionCount: 1,
	tags: [teatroRawTag, tragediaRawTag, dramaHistoricoRawTag],
	mediaSources: [],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'Escribí Nerón porque creí, durante algunos meses, que el incendio podía contarse desde adentro. Me equivoqué con método y precisión, que son las dos únicas formas decentes de equivocarse.',
		},
	],
};
