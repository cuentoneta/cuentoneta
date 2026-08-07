// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag } from '../../onoff-raw-tags.mock';
import {
	geometriaAudioDescription,
	geometriaPdfDescription,
	geometriaSpaceDescription,
	geometriaSpotifyDescription,
	geometriaYoutubeDescription,
} from '../media/geometria.media';
import geometriaEditorialNoteMd from './geometria.editorial-note.md?raw';
import { geometriaEpigraphReference, geometriaEpigraphText, geometriaSectionTitle } from './geometria.epigraph';
import geometriaMdBody from './geometria.md?raw';

export const geometriaRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-geometria',
	slug: 'geometria',
	title: 'Geometría',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-9e1eab984fbe94e19101c7aa4fc2e99a88f71736-236x328-png' },
	},
	editorialNote: geometriaEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1974)',
	publishedAt: '1974-01-01T00:00:00Z',
	totalReadingTime: 7,
	sectionCount: 1,
	tags: [cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag],
	mediaSources: [
		{
			_key: 'geometria-audio',
			_type: 'audioRecording',
			title: 'Lectura de "Geometría" por su autor',
			description: geometriaAudioDescription,
			url: 'https://cdn.example.org/onoff/geometria.ogg',
		},
		{
			_key: 'geometria-space',
			_type: 'spaceRecording',
			title: 'Conversación sobre el insomnio y la medida del tiempo',
			description: geometriaSpaceDescription,
			audioFile: { _type: 'file', asset: { _type: 'reference', _ref: 'file-geometria-space-ogg' } },
			hostName: 'Biblioteca del Méridien',
			hostAvatar: {
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-2c4d6e8a0b2d4f6a8c0e2d4f6a8b0c2d4e6f8a0b-96x96-png' },
			},
			date: '1974-06-12',
			duration: '48:12',
			audioUrl: 'https://cdn.example.org/onoff/geometria-space.ogg',
		},
		{
			_key: 'geometria-spotify',
			_type: 'spotifyPodcastEpisode',
			title: 'Episodio dedicado a "Geometría"',
			description: geometriaSpotifyDescription,
			url: 'https://open.spotify.com/embed/episode/geometria',
		},
		{
			_key: 'geometria-youtube',
			_type: 'youTubeVideo',
			title: 'Video ensayo sobre las coordenadas del desvelo',
			description: geometriaYoutubeDescription,
			videoId: 'geometriaVideoId',
		},
		{
			_key: 'geometria-pdf',
			_type: 'pdfLink',
			title: 'Facsímil de la primera edición',
			description: geometriaPdfDescription,
			url: 'https://cdn.example.org/onoff/geometria.pdf',
		},
	],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: geometriaSectionTitle,
			epigraphs: [{ text: geometriaEpigraphText, reference: geometriaEpigraphReference }],
			body: geometriaMdBody,
			readingTime: 7,
		},
	],
};
