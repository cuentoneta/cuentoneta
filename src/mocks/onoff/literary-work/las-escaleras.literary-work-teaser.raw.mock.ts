// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { absurdoRawTag, alegoriaRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';

export const lasEscalerasRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-las-escaleras',
	slug: 'las-escaleras',
	title: 'Las escaleras',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
	totalReadingTime: 9,
	sectionCount: 1,
	tags: [novelaRawTag, absurdoRawTag, alegoriaRawTag],
	mediaSources: [{ _type: 'audioRecording', title: 'Lectura de "Las escaleras" por su autor' }],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: null,
			body: 'Dos años después la encontré donde la había dejado, al pie de la escalera, midiendo con el pulgar la distancia exacta que separaba un peldaño del siguiente. La Sra. Oneiras no había envejecido; se había vuelto más precisa, como una cifra que se repite hasta perder su sentido.',
		},
	],
};
