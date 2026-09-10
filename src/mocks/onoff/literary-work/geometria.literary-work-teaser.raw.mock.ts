// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkTeasersResult } from '@sanity-types';
import { rawOnoffEmbeddedAuthor } from '../../onoff-raw-author.mock';
import { cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag } from '../../onoff-raw-tags.mock';
import { geometriaSectionTitle } from './geometria.epigraph';

export const geometriaRawLiteraryWorkTeaser: LiteraryWorkTeasersResult[number] = {
	_id: 'onoff-literary-work-geometria',
	slug: 'geometria',
	title: 'Geometría',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
	totalReadingTime: 7,
	sectionCount: 1,
	tags: [cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag],
	mediaSources: [
		{ _type: 'audioRecording', title: 'Lectura de "Geometría" por su autor' },
		{ _type: 'spaceRecording', title: 'Conversación sobre el insomnio y la medida del tiempo' },
		{ _type: 'spotifyPodcastEpisode', title: 'Episodio dedicado a "Geometría"' },
		{ _type: 'youTubeVideo', title: 'Video ensayo sobre las coordenadas del desvelo' },
		{ _type: 'pdfLink', title: 'Facsímil de la primera edición' },
	],
	authors: [rawOnoffEmbeddedAuthor],
	excerpt: [
		{
			_key: 'section-1',
			title: geometriaSectionTitle,
			body: 'A las tres y media en punto, sin que ningún despertador lo convoque, Shannon abre los ojos. La oscuridad de la habitación tiene siempre el mismo peso, el mismo gramaje exacto, como si la noche hubiera sido recortada con escuadra. No hay sobresalto: hay precisión.',
		},
	],
};
