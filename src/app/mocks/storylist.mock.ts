import { Storylist, StorylistStoriesNavigationTeasers, StorylistTeaser } from '@models/storylist.model';
import { tagMock } from './tag.mocks';
import { storyNavigationTeaserWithAuthor } from './story.mock';

// Colección — la obsesión de Onoff por el orden y el tiempo (Geometría, el desvelo). Proyección completa (Storylist).
export const storylistMock: Storylist = {
	_id: 'onoff-geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	slug: 'geometrias-del-desvelo',
	count: 1,
	media: [],
	tabs: [],
	description: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometrias-desc',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Onoff lleva la precisión del compás al territorio de lo humano: insomnios que se vuelven una geometría del tiempo, vidas reducidas a coordenadas, figuras que prometen un orden perfecto y terminan revelando, en algún vértice, su grieta.',
					_key: 'geometrias-span',
				},
			],
		},
	],
	imagery: {
		kind: 'representative',
		image: 'assets/img/mocks/collections/geometrias-del-desvelo.png',
	},
	tags: [tagMock],
	config: {
		showAuthors: true,
	},
	stories: [storyNavigationTeaserWithAuthor],
};

// Colección — la obsesión de Onoff por el orden y el tiempo (Geometría, el desvelo). Teaser con portada editorial propia → imagery representative.
export const storylistTeaserRepresentativeMock: StorylistTeaser = {
	_id: 'onoff-geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	slug: 'geometrias-del-desvelo',
	count: 10,
	media: [],
	tabs: [],
	stories: [],
	description: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometrias-desc',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Onoff lleva la precisión del compás al territorio de lo humano: insomnios que se vuelven una geometría del tiempo, vidas reducidas a coordenadas, figuras que prometen un orden perfecto y terminan revelando, en algún vértice, su grieta.',
					_key: 'geometrias-span',
				},
			],
		},
	],
	tags: [tagMock],
	config: { showAuthors: true },
	imagery: { kind: 'representative', image: 'assets/img/mocks/stories/geometria.png' },
};

// Colección — las pasiones que Onoff intenta catalogar (el placer, el odio, la dualidad). Teaser sin portada propia → imagery sample (3 portadas de historias).
export const storylistTeaserSampleMock: StorylistTeaser = {
	...storylistTeaserRepresentativeMock,
	_id: 'onoff-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'inventario-pasiones-desc',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Una colección sobre el deseo de ordenar lo inordenable. Onoff cataloga el placer, retrata el odio sin causa y enfrenta dos antorchas que nunca alumbran lo mismo: tratados que terminan por descubrir que toda taxonomía de lo humano es una forma elegante de perderlo.',
					_key: 'inventario-pasiones-span',
				},
			],
		},
	],
	imagery: {
		kind: 'sample',
		images: [
			'assets/img/mocks/stories/neron.png',
			'assets/img/mocks/stories/el-odio.png',
			'assets/img/mocks/stories/las-dos-antorchas.png',
		],
	},
};

// Colección — la desmesura del poder en Onoff (Nerón, la ambición y su ruina). Teaser de navegación.
export const storylistNavigationTeaserMock: StorylistStoriesNavigationTeasers = {
	_id: 'onoff-cronicas-de-la-desmesura',
	title: 'Crónicas de la desmesura',
	slug: 'cronicas-de-la-desmesura',
	count: 1,
	media: [],
	tabs: [],
	description: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'cronicas-desmesura-desc',
			markDefs: [],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Los textos donde Onoff interroga la desmesura del poder: emperadores que confunden el imperio con su propio cuerpo, voluntades que se agrandan hasta no caber en ninguna frontera. Retratos de la ambición y de su lenta, inevitable ruina.',
					_key: 'cronicas-desmesura-span',
				},
			],
		},
	],
	imagery: {
		kind: 'sample',
		images: [
			'assets/img/mocks/stories/neron.png',
			'assets/img/mocks/stories/el-odio.png',
			'assets/img/mocks/stories/las-dos-antorchas.png',
		],
	},
	tags: [tagMock],
	config: {
		showAuthors: true,
	},
	stories: [storyNavigationTeaserWithAuthor],
};
