import type { RotatingContentQueryResult, StoryBySlugQueryResult } from '../sanity/types';

export const rawOnoffAuthor: NonNullable<StoryBySlugQueryResult>['author'] = {
	_id: 'author_1',
	slug: 'francois-onoff',
	name: 'François Onoff',
	image: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350-jpg' },
	},
	nationality: {
		_id: 'nationality-francia',
		_type: 'nationality',
		_createdAt: '2021-12-28T00:00:00Z',
		_updatedAt: '2021-12-28T00:00:00Z',
		_rev: 'rev-francia',
		country: 'Francia',
		flag: {
			_type: 'image',
			asset: { _type: 'reference', _ref: 'image-b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20-png' },
		},
	},
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
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
	resources: [
		{
			title: 'Artículo de François Onoff en Wikipedia',
			url: 'https://es.wikipedia.org/wiki/Francois_Onoff',
			resourceType: {
				slug: 'wikipedia',
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
				icon: { _type: 'iconPicker', provider: 'fa', name: 'fa-wikipedia-w' },
			},
		},
	],
	tags: [],
};

export const rawOnoffAuthorTeaser: NonNullable<RotatingContentQueryResult>['mostRead'][0]['author'] = {
	_id: 'author_1',
	slug: 'francois-onoff',
	name: 'François Onoff',
	image: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350-jpg' },
	},
	nationality: {
		_id: 'nationality-francia',
		_type: 'nationality',
		_createdAt: '2021-12-28T00:00:00Z',
		_updatedAt: '2021-12-28T00:00:00Z',
		_rev: 'rev-francia',
		country: 'Francia',
		flag: {
			_type: 'image',
			asset: { _type: 'reference', _ref: 'image-b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20-png' },
		},
	},
	biography: [],
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
	resources: [],
};
