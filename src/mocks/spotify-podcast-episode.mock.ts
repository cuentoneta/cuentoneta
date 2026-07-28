import { SpotifyPodcastEpisode } from '@models/media.model';

export const spotifyPodcastEpisodeMock: SpotifyPodcastEpisode = {
	title:
		'Narración del cuento tomada del podcast "Historias narradas para ser escuchadas", producido por la Biblioteca Pedagógica de la Ciudad de Santa Fe.',
	type: 'spotifyPodcastEpisode',
	description: [
		{
			_key: '93a3b8bbeb86',
			markDefs: [],
			children: [
				{
					text: 'Narración del cuento parte del primer episodio del podcast "Historias narradas para ser escuchadas", producido por la Biblioteca Pedagógica de la Ciudad de Santa Fe.',
					_key: '9c6409086fe0',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
		},
	],
	data: {
		url: 'https://open.spotify.com/embed/episode/5XmGKzNdtU1Ca8xXZVTf2Q',
	},
};
