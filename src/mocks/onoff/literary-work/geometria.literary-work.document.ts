import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { LiteraryWork } from '@sanity-types';
import geometriaEditorialNoteMd from './geometria.editorial-note.md?raw';
import { geometriaEpigraphReference, geometriaEpigraphText, geometriaSectionTitle } from './geometria.epigraph';
import geometriaMdBody from './geometria.md?raw';

export const geometriaLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-geometria',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-geometria',
	_type: 'literaryWork',
	title: 'Geometría',
	slug: { _type: 'slug', current: 'geometria' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.geometriaCover.ref },
	},
	content: [
		{
			_type: 'section',
			_key: 'section-1',
			title: geometriaSectionTitle,
			epigraphs: [
				{ _type: 'epigraph', _key: 'epigraph-0', text: geometriaEpigraphText, reference: geometriaEpigraphReference },
			],
			body: geometriaMdBody,
			readingTime: 7,
		},
	],
	editorialNote: geometriaEditorialNoteMd,
	totalReadingTime: 7,
	mediaSources: [
		{
			_key: 'geometria-audio',
			_type: 'audioRecording',
			title: 'Lectura de "Geometría" por su autor',
			description: 'Grabación casera, 1974.',
			url: 'https://cdn.example.org/onoff/geometria.ogg',
		},
		{
			_key: 'geometria-space',
			_type: 'spaceRecording',
			title: 'Conversación sobre el insomnio y la medida del tiempo',
			description:
				'Espacio grabado con lectores de Onoff, a partir del *cuaderno de 1971* y de la [edición facsimilar](https://cdn.example.org/onoff/geometria.pdf).',
			audioFile: { _type: 'file', asset: { _type: 'reference', _ref: 'file-geometria-space-ogg' } },
			hostName: 'Biblioteca del Méridien',
			hostAvatar: {
				_type: 'image',
				asset: { _type: 'reference', _ref: onoffImageAssets.defaultAvatar.ref },
			},
			date: '1974-06-12',
			duration: '48:12',
		},
		{
			_key: 'geometria-spotify',
			_type: 'spotifyPodcastEpisode',
			title: 'Episodio dedicado a "Geometría"',
			description: 'Análisis de la obra en formato **podcast**.',
			url: 'https://open.spotify.com/embed/episode/geometria',
		},
		{
			_key: 'geometria-youtube',
			_type: 'youTubeVideo',
			title: 'Video ensayo sobre las coordenadas del desvelo',
			description: 'Ensayo audiovisual sobre la obra.',
			videoId: 'geometriaVideoId',
		},
		{
			_key: 'geometria-pdf',
			_type: 'pdfLink',
			title: 'Facsímil de la primera edición',
			description: 'Escaneo de la edición de 1974.',
			url: 'https://cdn.example.org/onoff/geometria.pdf',
		},
	],
	resources: [],
	tags: [
		{ _key: 'cuento', _type: 'reference', _ref: 'tag-cuento' },
		{ _key: 'drama-psicologico', _type: 'reference', _ref: 'tag-drama-psicologico' },
		{ _key: 'filosofico', _type: 'reference', _ref: 'tag-filosofico' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1974)',
	publishedAt: '1974-01-01T00:00:00Z',
};
