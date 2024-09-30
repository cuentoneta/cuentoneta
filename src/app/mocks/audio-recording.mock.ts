import { AudioRecording } from '@models/media.model';

export const audioRecordingMock: AudioRecording = {
	title: 'Lectura de artículo en formato .ogg',
	type: 'audioRecording',
	description: [
		{
			_key: '93a3b8bbeb86',
			markDefs: [],
			children: [
				{
					text: 'Lectura del artículo sobre ajedrez en Wikipedia.',
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
		url: 'https://es.wikipedia.org/wiki/Archivo:Es-Ajedrez-article-part1.ogg',
	},
};
