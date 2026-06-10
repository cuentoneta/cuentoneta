import { DocumentPdfIcon, DocumentVideoIcon, PlayIcon, TwitterIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const audioRecording = defineType({
	name: 'audioRecording',
	title: 'Grabación de audio con el relato del texto',
	type: 'object',
	icon: PlayIcon,
	preview: {
		select: {
			title: 'title',
			url: 'url',
		},
		prepare(selection) {
			const { title, url } = selection;
			return {
				title: `${title}`,
				subtitle: ` URL Grabación: ${url}`,
			};
		},
	},
	fields: [
		defineField({
			name: 'title',
			title: 'Título asignado a la grabación de audio',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción de la grabación de audio',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'url',
			title: 'URL del archivo de audio (mp3, wav, etc.)',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
	],
});

export const spotifyPodcastEpisode = defineType({
	name: 'spotifyPodcastEpisode',
	title: 'Episodio de podcast de Spotify',
	type: 'object',
	icon: PlayIcon,
	preview: {
		select: {
			title: 'title',
			url: 'url',
		},
		prepare(selection) {
			const { title, url } = selection;
			return {
				title: `${title}`,
				subtitle: `URL del podcast: ${url}`,
			};
		},
	},
	fields: [
		defineField({
			name: 'title',
			title: 'Título asignado al episodio del podcast',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción del episodio del podcast',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'url',
			title:
				'URL del episodio del podcast (formato https://open.spotify.com/episode/3nRxeRnDvYkhegmyRqDhh0 o bien https://open.spotify.com/embed/episode/3nRxeRnDvYkhegmyRqDhh0)',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
	],
});

export const spaceRecording = defineType({
	name: 'spaceRecording',
	title: 'Grabación de Spaces de X',
	type: 'object',
	icon: TwitterIcon,
	preview: {
		select: {
			title: 'title',
			hostName: 'hostName',
			media: 'hostAvatar',
		},
		prepare(selection) {
			const { title, hostName } = selection;
			return {
				title: `${title}`,
				subtitle: hostName ? `Anfitrión: ${hostName}` : 'Grabación de Space de X',
			};
		},
	},
	fields: [
		defineField({
			name: 'title',
			title: 'Título del space',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción del space',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'audioFile',
			title: 'Archivo de audio de la grabación',
			description: 'Archivo de audio del space (mp4, m4a, mp3). Se reproduce por streaming desde el sitio.',
			type: 'file',
			options: { accept: 'audio/*,video/mp4' },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'hostName',
			title: 'Nombre del anfitrión',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'hostAvatar',
			title: 'Avatar del anfitrión',
			type: 'image',
		}),
		defineField({
			name: 'date',
			title: 'Fecha del space',
			type: 'date',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'duration',
			title: 'Duración del space',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
	],
});

export const youtubeVideo = defineType({
	name: 'youTubeVideo',
	title: 'Video de YouTube',
	type: 'object',
	icon: DocumentVideoIcon,
	preview: {
		select: {
			title: 'title',
			url: 'url',
		},
		prepare(selection) {
			const { title, url } = selection;
			return {
				title: `${title}`,
				subtitle: `URL Video: ${url}`,
			};
		},
	},
	fields: [
		{
			name: 'title',
			title: 'Título del video',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción del video',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'videoId',
			title: 'ID del video de YouTube',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
	],
});

export const pdfLink = defineType({
	name: 'pdfLink',
	title: 'Enlace a archivo PDF',
	type: 'object',
	icon: DocumentPdfIcon,
	preview: {
		select: {
			title: 'title',
			url: 'url',
		},
		prepare(selection) {
			const { title, url } = selection;
			return {
				title: `${title}`,
				subtitle: `URL PDF: ${url}`,
			};
		},
	},
	fields: [
		defineField({
			name: 'title',
			title: 'Título del documento PDF',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción del documento PDF',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'url',
			title: 'URL del archivo PDF',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
	],
});
