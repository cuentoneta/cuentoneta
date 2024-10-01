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
				title: [
					{
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: 'Desde el barrio de Flores...',
								_key: 'cc8a98d050de0',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: 'b12e042c1a31',
					},
				],
				subtitle: [
					{
						_type: 'block',
						style: 'normal',
						_key: 'baac3bcc7c08',
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: '... la primer entrega de este ciclo',
								_key: '924292fa7c290',
							},
						],
					},
				],
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/d1954f5948a07ec4f02c9c621f664e42bbe61ce9-540x220.jpg',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				title: [
					{
						_key: '9de26f2cc5e0',
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: 'Desde el barrio de Flores...',
								_key: 'f594b7f75e840',
							},
						],
						_type: 'block',
						style: 'normal',
					},
				],
				subtitle: [
					{
						_key: '0ef423b069c2',
						markDefs: [],
						children: [
							{
								text: '... la entrega #1 del ciclo ',
								_key: '473f38357e750',
								_type: 'span',
								marks: [],
							},
							{
								_key: 'cf112a622e8c',
								_type: 'span',
								marks: ['em', 'strong'],
								text: 'Pluma de la semana',
							},
						],
						_type: 'block',
						style: 'normal',
					},
				],
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
				title: [
					{
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: 'Los cuentos de iSAT...',
								_key: '4fd9c32a66da0',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: 'fd0769af1592',
					},
				],
				subtitle: [
					{
						_key: '2f0236fc48e6',
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: '...recopilados en texto y video',
								_key: 'd41720abdbd90',
							},
						],
						_type: 'block',
						style: 'normal',
					},
				],
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/611360ec02e690fc8c56d674162815690ea0b1fc-540x220.jpg',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				title: [
					{
						markDefs: [],
						children: [
							{
								text: 'Los cuentos de iSAT...',
								_key: '5db36a4ee5620',
								_type: 'span',
								marks: [],
							},
						],
						_type: 'block',
						style: 'normal',
						_key: 'e3561466ffbe',
					},
				],
				subtitle: [
					{
						_key: '6799282866a4',
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: '... en texto y video con narración de Alberto Laiseca',
								_key: '74b7ce0ce36c0',
							},
						],
						_type: 'block',
						style: 'normal',
					},
				],
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/5e37e287e037a35f9034abb9da33dac68acc6517-960x280.jpg',
				imageWidth: 960,
				imageHeight: 280,
			},
		},
	},
];
