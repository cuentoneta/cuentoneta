import { ContentCampaign } from '@models/content-campaign.model';
export const contentCampaignMock: ContentCampaign[] = [
	{
		description: [
			{
				style: 'normal',
				_key: '09bf9f4aeccb',
				markDefs: [],
				children: [
					{
						text: 'Edición #1 del ciclo ',
						_key: '3d8e33327972',
						_type: 'span',
						marks: [],
					},
					{
						text: 'Pluma de la semana',
						_key: 'd9f0b0e822ff',
						_type: 'span',
						marks: ['strong', 'em'],
					},
					{
						_type: 'span',
						marks: [],
						text: ', destacando obras de Alejandro Dolina e incluyendo narraciones en formato audio de sus cuentos.',
						_key: '610dceac7d20',
					},
				],
				_type: 'block',
			},
		],
		url: '../author/alejandro-dolina',
		contents: {
			xs: {
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/d1954f5948a07ec4f02c9c621f664e42bbe61ce9-540x220.jpg',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/ec31c09f54fe53f4de213075d2e73e61805fbf4f-960x280.jpg',
				imageWidth: 960,
				imageHeight: 280,
			},
		},
		title: 'Pluma de la Semana #1: Alejandro Dolina',
		slug: 'pluma-de-la-semana-1',
	},
	{
		title: 'Cuentos de terror con Alberto Laiseca',
		slug: 'cuentos-de-terror-con-alberto-laiseca',
		description: [
			{
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: [],
						text: 'Recopilación de los cuentos relatados por Alberto Laiseca en el programa ',
						_key: '712feffe72a3',
					},
					{
						_type: 'span',
						marks: ['strong', 'em'],
						text: 'Cuentos de Terror con Alberto Laiseca',
						_key: '51f3963a90ee',
					},
					{
						marks: [],
						text: ', originalmente emitido en la señal iSAT entre 2002 y 2005.',
						_key: 'a4c15af18f34',
						_type: 'span',
					},
				],
				_type: 'block',
				style: 'normal',
				_key: '59ffda9f06cb',
			},
		],
		url: '../storylist/cuentos-de-terror-de-alberto-laiseca',
		contents: {
			xs: {
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/611360ec02e690fc8c56d674162815690ea0b1fc-540x220.jpg',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/5e37e287e037a35f9034abb9da33dac68acc6517-960x280.jpg',
				imageWidth: 960,
				imageHeight: 280,
			},
		},
	},
];
