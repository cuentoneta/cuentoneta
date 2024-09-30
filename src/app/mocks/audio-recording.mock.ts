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
					text: 'Lectura del artículo sobre ',
					_key: '9c6409086fe0',
					_type: 'span',
					marks: [],
				},
				{
					_type: 'span',
					marks: ['em'],
					text: 'ajedrez',
					_key: '26de23832101',
				},
				{
					_type: 'span',
					marks: [],
					text: 'en Wikipedia.',
					_key: '5816b3cc116b',
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
