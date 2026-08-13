import { Storylist, StorylistTeaser } from '@models/storylist.model';
import { colaborativaTagMock } from './onoff-tags.mock';
import { onoffImageAssets } from './onoff-image-assets.mock';

import { onoffStoryTeasersMock } from './onoff-story-teasers.mock';

// Colección — la obsesión de Onoff por el orden y el tiempo (Geometría, el desvelo). Proyección completa (Storylist).
export const storylistMock: Storylist = {
	_id: 'onoff-geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	slug: 'geometrias-del-desvelo',
	count: 3,
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
		image: onoffImageAssets.geometriasDelDesveloCover.path,
	},
	tags: [colaborativaTagMock],
	config: {
		showAuthors: true,
	},
	stories: onoffStoryTeasersMock.slice(0, 3),
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
	tags: [colaborativaTagMock],
	config: { showAuthors: true },
	imagery: { kind: 'representative', image: onoffImageAssets.geometriaCover.path },
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
			onoffImageAssets.neronCover.path,
			onoffImageAssets.elOdioCover.path,
			onoffImageAssets.lasDosAntorchasCover.path,
		],
	},
};
