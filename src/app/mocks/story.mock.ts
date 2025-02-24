import { Story, StoryPreview, StoryTeaser } from '@models/story.model';
import { authorMock, authorTeaserMock } from './author.mock';
import { Publication, Storylist } from '@models/storylist.model';
import { tagMock } from './tag.mocks';

export const storyMock: Story = {
	_id: 'story-1',
	resources: [
		{
			title: 'Recurso original',
			url: 'https://biblioteca.es/el-espejo-del-tiempo',
			resourceType: {
				title: 'Recurso Original',
				shortDescription: 'Recurso original de este contenido',
				description: [
					{
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: 'Recurso original de este contenido',
								_key: 'd92a239f37e50',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: '05dc9f3aa317',
					},
				],
				icon: {
					provider: 'fa',
					name: 'fa-medal',
				},
			},
		},
	],
	title: 'El espejo del tiempo',
	badLanguage: false,
	originalPublication: 'Ecos del silencio (1983)',
	approximateReadingTime: 2,
	slug: 'el-espejo-del-tiempo',
	language: 'es',
	media: [
		{
			title: 'Narración del cuento a cargo de Gérard Depardieu',
			type: 'youTubeVideo',
			description: [
				{
					markDefs: [
						{
							href: 'https://www.youtube.com/@CanalMas',
							_key: '213348c4e976',
							_type: 'link',
						},
					],
					children: [
						{
							_type: 'span',
							marks: [],
							text: 'Narración del cuento a cargo de Gérard Depardieu, transmitido como parte de un episodio de su programa radial ',
							_key: '0ee084c6737c',
						},
						{
							text: 'Le Ble Chateau',
							_key: 'b53d65716513',
							_type: 'span',
							marks: ['em'],
						},
						{
							marks: [],
							text: ', tomado del canal de ',
							_key: '462fa9bc3533',
							_type: 'span',
						},
						{
							_type: 'span',
							marks: ['213348c4e976'],
							text: 'Canal+',
							_key: 'a2a6c6ca73bc',
						},
						{
							text: '.',
							_key: '44b2cc7f7eb3',
							_type: 'span',
							marks: [],
						},
					],
					_type: 'block',
					style: 'normal',
					_key: '2baecc647476',
				},
			],
			data: {
				videoId: 'YmDQTmbc_CU',
			},
		},
	],
	author: authorMock,
	paragraphs: [
		{
			markDefs: [],
			children: [
				{
					text: 'Marie se detuvo frente al antiguo espejo de su abuela, sus dedos temblorosos rozando el marco de madera tallada. El reflejo que le devolvía la mirada no era el suyo, sino el de una joven de ojos brillantes y sonrisa despreocupada. Marie, ahora con 60 años, reconoció a su yo de 20.',
					_key: '6203fc30fdf90',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'add385219da2',
		},
		{
			children: [
				{
					text: '"¿Marie? ¿Estás lista?" La voz de su marido, Pierre, resonó desde el piso de abajo.',
					_key: 'abf0ba06e2fe',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'e65b26cf79aa',
			markDefs: [],
		},
		{
			children: [
				{
					_type: 'span',
					marks: [],
					text: '"Un momento", respondió, sin apartar la vista del espejo.',
					_key: 'de532604f30b',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'f496563a74c2',
			markDefs: [],
		},
		{
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'La joven del reflejo le sonrió, pero sus ojos traicionaban una profunda tristeza. Marie recordó ese día, hace cuarenta años, cuando se preparaba para su boda con Antoine. El vestido blanco, las flores, la emoción... y el terrible accidente que se llevó la vida de su prometido camino a la iglesia.',
					_key: 'a96ad6a9fbc9',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '3b32e1fbea97',
		},
		{
			style: 'normal',
			_key: '185c582ee3fd',
			markDefs: [],
			children: [
				{
					text: 'El reflejo cambió. Ahora mostraba a Marie a los 30, con un bebé en brazos. Recordó el dolor de perder a su hijo por una enfermedad repentina, apenas unos meses después de este momento capturado en el espejo.',
					_key: '2ea3ac0b8c5e0',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
		},
		{
			_key: 'e521c2dcf00a',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: '"Marie, llegaremos tarde", insistió Pierre.',
					_key: '53f4149fd6d90',
				},
			],
			_type: 'block',
			style: 'normal',
		},
		{
			_key: '7205d0b15a5d',
			markDefs: [],
			children: [
				{
					text: 'Otra vez el reflejo se transformó. Marie a los 40, radiante junto a Pierre el día de su boda. Una segunda oportunidad en el amor, pensó. Pero el espejo no mostraba las noches de insomnio, las pesadillas sobre Antoine y su hijo, el peso de los secretos que nunca compartió con Pierre.',
					_key: '4589c95973c30',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
		},
		{
			markDefs: [],
			children: [
				{
					text: 'Marie parpadeó, y por un instante vio su reflejo actual: una mujer de 60 años, con el rostro surcado por arrugas que contaban historias de alegría y dolor. Detrás de ella, en el espejo, aparecieron las figuras translúcidas de Antoine y su hijo.',
					_key: '978a2e00e7790',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '3f078f6de17a',
		},
		{
			markDefs: [],
			children: [
				{
					_key: 'a98c301b617a0',
					_type: 'span',
					marks: [],
					text: '"Ven con nosotros", susurraron. "Aquí no hay dolor, solo recuerdos felices".',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'fe7a34851dbb',
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'e1bff700a96d',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Marie extendió su mano hacia el espejo, sus dedos casi tocando la superficie fría y lisa.',
					_key: '8ca5e417f8000',
				},
			],
		},
		{
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: '"¡Marie!" La voz de Pierre, ahora alarmada, la sacó de su trance. El espejo volvió a mostrar solo su reflejo actual.',
					_key: 'cc11464e55500',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '40e9c60825f4',
		},
		{
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Marie retrocedió, confundida y asustada. ¿Cuánto tiempo había estado frente al espejo? ¿Realmente había visto a Antoine y a su hijo?',
					_key: '425ddf8c75ae0',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'e01dc634143e',
		},
		{
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Con un último vistazo al espejo, Marie salió de la habitación. Mientras bajaba las escaleras, se preguntó si algún día podría liberarse del peso de sus recuerdos o si, como el espejo, estaba condenada a revivir eternamente su pasado, atrapada entre ecos de silencio y reflejos de lo que pudo haber sido.',
					_key: 'ae9677c2e7df0',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'e1c826e7df35',
		},
	],
	summary: [
		{
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: ['em', 'strong'],
					text: 'El espejo del tiempo',
					_key: 'b728562e9c5e0',
				},
				{
					_type: 'span',
					marks: [],
					text: ' forma parte de la colección ',
					_key: 'bc2489220038',
				},
				{
					_type: 'span',
					marks: ['em'],
					text: 'Ecos del Silencio',
					_key: '44cf0602bcae',
				},
				{
					_key: 'baa68063f158',
					_type: 'span',
					marks: [],
					text: ' (1983), la primera colección de cuentos publicada por Onoff. Mediante un estilo de realismo psicológico, el autor narra en esta breve historia la forma en que los recuerdos y el pasado pueden atormentar y distorsionar la percepción del presente. Onoff instala el espejo antiguo como un portal metafórico entre el presente y el pasado de la protagonista, utilizándolo como un dispositivo para explorar la fragilidad de la mente humana frente a la culpa y el arrepentimiento.',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '1ed7722f9317',
		},
	],
	epigraphs: [
		{
			text: [
				{
					children: [
						{
							_type: 'span',
							marks: [],
							text: 'Le passé est un miroir brisé; chaque fragment reflète une vérité différente.',
							_key: '3cfcb08396f00',
						},
					],
					_type: 'block',
					style: 'normal',
					_key: '8412a637a907',
					markDefs: [],
				},
			],
			reference: [],
		},
	],
};

export const storyPreviewMock: StoryPreview = {
	_id: 'story-1',
	resources: [
		{
			title: 'Recurso original',
			url: 'https://biblioteca.es/el-espejo-del-tiempo',
			resourceType: {
				title: 'Recurso Original',
				shortDescription: 'Recurso original de este contenido',
				description: [
					{
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: 'Recurso original de este contenido',
								_key: 'd92a239f37e50',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: '05dc9f3aa317',
					},
				],
				icon: {
					provider: 'fa',
					name: 'fa-medal',
				},
			},
		},
	],
	title: 'El espejo del tiempo',
	badLanguage: false,
	originalPublication: 'Ecos del silencio (1983)',
	approximateReadingTime: 2,
	slug: 'el-espejo-del-tiempo',
	language: 'es',
	media: [
		{
			title: 'Video',
			type: 'youTubeVideo',
			description: [
				{
					style: 'normal',
					_key: '338be209b296',
					markDefs: [],
					children: [
						{
							text: 'Narración del cuento a cargo de Gérard Depardieu',
							_key: '1adaad6a0f84',
							_type: 'span',
							marks: [],
						},
					],
					_type: 'block',
				},
			],
			data: {
				videoId: 'pB4GTan0y64',
			},
		},
	],
	author: authorTeaserMock,
	paragraphs: [
		{
			style: 'normal',
			_key: 'add385219da2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Marie se detuvo frente al antiguo espejo de su abuela, sus dedos temblorosos rozando el marco de madera tallada. El reflejo que le devolvía la mirada no era el suyo, sino el de una joven de ojos brillantes y sonrisa despreocupada. Marie, ahora con 60 años, reconoció a su yo de 20.',
					_key: '6203fc30fdf90',
				},
			],
			_type: 'block',
		},
		{
			markDefs: [],
			children: [
				{
					_key: 'abf0ba06e2fe',
					_type: 'span',
					marks: [],
					text: '"¿Marie? ¿Estás lista?" La voz de su marido, Pierre, resonó desde el piso de abajo.',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'e65b26cf79aa',
		},
		{
			children: [
				{
					text: '"Un momento", respondió, sin apartar la vista del espejo.',
					_key: 'de532604f30b',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'f496563a74c2',
			markDefs: [],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: '3b32e1fbea97',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'La joven del reflejo le sonrió, pero sus ojos traicionaban una profunda tristeza. Marie recordó ese día, hace cuarenta años, cuando se preparaba para su boda con Antoine. El vestido blanco, las flores, la emoción... y el terrible accidente que se llevó la vida de su prometido camino a la iglesia.',
					_key: 'a96ad6a9fbc9',
				},
			],
		},
	],
};

export const storyTeaserMock: StoryTeaser = {
	_id: 'story-1',
	resources: [
		{
			title: 'Recurso original',
			url: 'https://biblioteca.es/el-espejo-del-tiempo',
			resourceType: {
				title: 'Recurso Original',
				shortDescription: 'Recurso original de este contenido',
				description: [
					{
						markDefs: [],
						children: [
							{
								_type: 'span',
								marks: [],
								text: 'Recurso original de este contenido',
								_key: 'd92a239f37e50',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: '05dc9f3aa317',
					},
				],
				icon: {
					provider: 'fa',
					name: 'fa-medal',
				},
			},
		},
	],
	title: 'El espejo del tiempo',
	badLanguage: false,
	originalPublication: 'Ecos del silencio (1983)',
	approximateReadingTime: 2,
	slug: 'el-espejo-del-tiempo',
	language: 'es',
	media: [
		{
			title: 'Narración del cuento a cargo de Gérard Depardieu',
			type: 'youTubeVideo',
			description: [
				{
					markDefs: [
						{
							href: 'https://www.youtube.com/@CanalMas',
							_key: '213348c4e976',
							_type: 'link',
						},
					],
					children: [
						{
							_type: 'span',
							marks: [],
							text: 'Narración del cuento a cargo de Gérard Depardieu, transmitido como parte de un episodio de su programa radial ',
							_key: '0ee084c6737c',
						},
						{
							text: 'Le Ble Chateau',
							_key: 'b53d65716513',
							_type: 'span',
							marks: ['em'],
						},
						{
							marks: [],
							text: ', tomado del canal de ',
							_key: '462fa9bc3533',
							_type: 'span',
						},
						{
							_type: 'span',
							marks: ['213348c4e976'],
							text: 'Canal+',
							_key: 'a2a6c6ca73bc',
						},
						{
							text: '.',
							_key: '44b2cc7f7eb3',
							_type: 'span',
							marks: [],
						},
					],
					_type: 'block',
					style: 'normal',
					_key: '2baecc647476',
				},
			],
			data: {
				videoId: 'YmDQTmbc_CU',
			},
		},
	],
	paragraphs: [
		{
			markDefs: [],
			children: [
				{
					text: 'Marie se detuvo frente al antiguo espejo de su abuela, sus dedos temblorosos rozando el marco de madera tallada. El reflejo que le devolvía la mirada no era el suyo, sino el de una joven de ojos brillantes y sonrisa despreocupada. Marie, ahora con 60 años, reconoció a su yo de 20.',
					_key: '6203fc30fdf90',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'add385219da2',
		},
		{
			children: [
				{
					text: '"¿Marie? ¿Estás lista?" La voz de su marido, Pierre, resonó desde el piso de abajo.',
					_key: 'abf0ba06e2fe',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'e65b26cf79aa',
			markDefs: [],
		},
		{
			children: [
				{
					_type: 'span',
					marks: [],
					text: '"Un momento", respondió, sin apartar la vista del espejo.',
					_key: 'de532604f30b',
				},
			],
			_type: 'block',
			style: 'normal',
			_key: 'f496563a74c2',
			markDefs: [],
		},
	],
};

export const publicationMock: Publication = {
	publishingOrder: 54,
	published: true,
	publishingDate: '2024-10-27',
	story: storyPreviewMock,
};

export const storyListMock: Storylist = {
	title: 'La Cuentoneta 1.0"',
	slug: 'verano-2022',
	displayDates: true,
	editionPrefix: 'Día',
	count: 1,
	comingNextLabel: 'Próximamente',
	description: [
		{
			_type: 'block',
			style: 'normal',
			_key: '58f75b67346a',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'La colección de cuentos de la primera versión de La Cuentoneta, publicados diariamente entre el Año Nuevo y el Martes de Carnaval de 2022. Esta colección consiste de sesenta textos, todos ellos de diferentes autores.',
					_key: 'e846ec598eb60',
				},
			],
		},
	],
	language: 'es',
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/production/d1a7fc995e0a4d640c9d8e98fb56f56f209f3d89-392x318.webp',
	tags: [tagMock],
	publications: [publicationMock],
};
