import { Story, StoryPreview, StoryTeaser } from '@models/story.model';
import { authorMock, authorTeaserMock } from './author.mock';

export const storyMock: Story = {
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
					svg: 'data:image/svg+xml,<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path d="M223.75 130.75L154.62 15.54A31.997 31.997 0 0 0 127.18 0H16.03C3.08 0-4.5 14.57 2.92 25.18l111.27 158.96c29.72-27.77 67.52-46.83 109.56-53.39zM495.97 0H384.82c-11.24 0-21.66 5.9-27.44 15.54l-69.13 115.21c42.04 6.56 79.84 25.62 109.56 53.38L509.08 25.18C516.5 14.57 508.92 0 495.97 0zM256 160c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm92.52 157.26l-37.93 36.96 8.97 52.22c1.6 9.36-8.26 16.51-16.65 12.09L256 393.88l-46.9 24.65c-8.4 4.45-18.25-2.74-16.65-12.09l8.97-52.22-37.93-36.96c-6.82-6.64-3.05-18.23 6.35-19.59l52.43-7.64 23.43-47.52c2.11-4.28 6.19-6.39 10.28-6.39 4.11 0 8.22 2.14 10.33 6.39l23.43 47.52 52.43 7.64c9.4 1.36 13.17 12.95 6.35 19.59z"></path></svg>',
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
					svg: 'data:image/svg+xml,<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path d="M223.75 130.75L154.62 15.54A31.997 31.997 0 0 0 127.18 0H16.03C3.08 0-4.5 14.57 2.92 25.18l111.27 158.96c29.72-27.77 67.52-46.83 109.56-53.39zM495.97 0H384.82c-11.24 0-21.66 5.9-27.44 15.54l-69.13 115.21c42.04 6.56 79.84 25.62 109.56 53.38L509.08 25.18C516.5 14.57 508.92 0 495.97 0zM256 160c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm92.52 157.26l-37.93 36.96 8.97 52.22c1.6 9.36-8.26 16.51-16.65 12.09L256 393.88l-46.9 24.65c-8.4 4.45-18.25-2.74-16.65-12.09l8.97-52.22-37.93-36.96c-6.82-6.64-3.05-18.23 6.35-19.59l52.43-7.64 23.43-47.52c2.11-4.28 6.19-6.39 10.28-6.39 4.11 0 8.22 2.14 10.33 6.39l23.43 47.52 52.43 7.64c9.4 1.36 13.17 12.95 6.35 19.59z"></path></svg>',
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
					svg: 'data:image/svg+xml,<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path d="M223.75 130.75L154.62 15.54A31.997 31.997 0 0 0 127.18 0H16.03C3.08 0-4.5 14.57 2.92 25.18l111.27 158.96c29.72-27.77 67.52-46.83 109.56-53.39zM495.97 0H384.82c-11.24 0-21.66 5.9-27.44 15.54l-69.13 115.21c42.04 6.56 79.84 25.62 109.56 53.38L509.08 25.18C516.5 14.57 508.92 0 495.97 0zM256 160c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm92.52 157.26l-37.93 36.96 8.97 52.22c1.6 9.36-8.26 16.51-16.65 12.09L256 393.88l-46.9 24.65c-8.4 4.45-18.25-2.74-16.65-12.09l8.97-52.22-37.93-36.96c-6.82-6.64-3.05-18.23 6.35-19.59l52.43-7.64 23.43-47.52c2.11-4.28 6.19-6.39 10.28-6.39 4.11 0 8.22 2.14 10.33 6.39l23.43 47.52 52.43 7.64c9.4 1.36 13.17 12.95 6.35 19.59z"></path></svg>',
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
