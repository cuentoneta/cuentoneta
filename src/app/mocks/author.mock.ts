import { Author, AuthorTeaser } from '@models/author.model';

export const authorMock: Author = {
	slug: 'francois-onoff',
	nationality: {
		country: 'Francia',
		flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20.png',
	},
	resources: [
		{
			title: 'Artículo de François Onoff en Wikipedia',
			url: 'https://es.wikipedia.org/wiki/Francois_Onoff',
			resourceType: {
				title: 'Wikipedia',
				shortDescription: 'Enlace a artículo de Wikipedia',
				description: [
					{
						_key: '020ccde1fe7d',
						markDefs: [],
						children: [
							{
								text: 'Enlace a artículo de Wikipedia',
								_key: '1dadfddec1750',
								_type: 'span',
								marks: [],
							},
						],
						_type: 'block',
						style: 'normal',
					},
				],
				icon: {
					provider: 'fa',
					name: 'fa-wikipedia-w',
					svg: 'data:image/svg+xml,<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path d="M640 51.2l-.3 12.2c-28.1.8-45 15.8-55.8 40.3-25 57.8-103.3 240-155.3 358.6H415l-81.9-193.1c-32.5 63.6-68.3 130-99.2 193.1-.3.3-15 0-15-.3C172 352.3 122.8 243.4 75.8 133.4 64.4 106.7 26.4 63.4.2 63.7c0-3.1-.3-10-.3-14.2h161.9v13.9c-19.2 1.1-52.8 13.3-43.3 34.2 21.9 49.7 103.6 240.3 125.6 288.6 15-29.7 57.8-109.2 75.3-142.8-13.9-28.3-58.6-133.9-72.8-160-9.7-17.8-36.1-19.4-55.8-19.7V49.8l142.5.3v13.1c-19.4.6-38.1 7.8-29.4 26.1 18.9 40 30.6 68.1 48.1 104.7 5.6-10.8 34.7-69.4 48.1-100.8 8.9-20.6-3.9-28.6-38.6-29.4.3-3.6 0-10.3.3-13.6 44.4-.3 111.1-.3 123.1-.6v13.6c-22.5.8-45.8 12.8-58.1 31.7l-59.2 122.8c6.4 16.1 63.3 142.8 69.2 156.7L559.2 91.8c-8.6-23.1-36.4-28.1-47.2-28.3V49.6l127.8 1.1.2.5z"></path></svg>',
				},
			},
		},
	],
	imageUrl: 'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
	name: 'François Onoff',
	biography: [
		{
			children: [
				{
					_type: 'span',
					marks: ['strong'],
					text: 'François Onoff ',
					_key: 'b2399ab5fba8',
				},
				{
					_type: 'span',
					marks: [],
					text: '(Chateauroux, 1948 - París, 1994) fue un escritor francés, reconocido como uno de los principales exponentes del realismo psicológico en la literatura de finales del siglo XX. La novela ',
					_key: '184064d1e14e',
				},
				{
					_key: 'c8faa6f7502e',
					_type: 'span',
					marks: ['em'],
					text: 'El palacio de las nueve fronteras',
				},
				{
					_type: 'span',
					marks: [],
					text: ' (1990), en la cual realiza una profunda exploración de la psique humana y la ambigüedad de la memoria, lo catapultó a la fama internacional y es considerada su obra maestra.',
					_key: '4a569a405101',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '55d66b6f6c01',
			markDefs: [],
		},
		{
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Onoff se destacó por su habilidad para fusionar elementos del thriller psicológico con reflexiones filosóficas sobre la identidad y la percepción de la realidad. Su colección de cuentos ',
					_key: 'a58c717facf60',
				},
				{
					_type: 'span',
					marks: ['em'],
					text: 'Ecos del silencio',
					_key: 'f09f2317edf1',
				},
				{
					_type: 'span',
					marks: [],
					text: ' (1983) mostró por primera vez su talento para crear atmósferas inquietantes y personajes atormentados por sus propios recuerdos.',
					_key: '31a9df1990bc',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'cdc729412a8f',
		},
		{
			markDefs: [],
			children: [
				{
					marks: [],
					text: 'Su último manuscrito inacabado, ',
					_key: 'c9ad2571947b0',
					_type: 'span',
				},
				{
					_type: 'span',
					marks: ['em'],
					text: 'Sinfonía de sombras',
					_key: 'd29c792cc843',
				},
				{
					_type: 'span',
					marks: [],
					text: ', fue publicado en 1998 y es considerado por muchos como un testimonio conmovedor de su genio creativo y una visión de la dirección que su escritura podría haber tomado de haber vivido más tiempo.',
					_key: 'f258a3f8d34e',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '59089d1c58c4',
		},
	],
};
export const authorTeaserMock: AuthorTeaser = {
	slug: 'francois-onoff',
	nationality: {
		country: 'Francia',
		flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20.png',
	},
	resources: [],
	imageUrl: 'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
	name: 'François Onoff',
	biography: [],
};
