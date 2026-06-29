import { Storylist, StorylistStoriesNavigationTeasers, StorylistTeaser } from '@models/storylist.model';
import { tagMock } from './tag.mocks';
import { storyNavigationTeaserWithAuthor } from './story.mock';

export const storylistMock: Storylist = {
	_id: 'cuentoneta-10',
	title: 'La Cuentoneta 1.0',
	slug: 'verano-2022',
	count: 1,
	media: [],
	tabs: [],
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
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/production/edd62a3131bd1f46e796e473d0b2b12d1c63c229-1024x1536.png',
	tags: [tagMock],
	config: {
		showAuthors: true,
	},
	stories: [storyNavigationTeaserWithAuthor],
};

// Teaser con portada editorial propia → imagery representative.
export const storylistTeaserRepresentativeMock: StorylistTeaser = {
	_id: 'cuentoneta-10',
	title: 'La Cuentoneta 1.0',
	slug: 'verano-2022',
	count: 10,
	media: [],
	tabs: [],
	stories: [],
	description: storylistMock.description,
	tags: [tagMock],
	config: { showAuthors: true },
	imagery: { kind: 'representative', image: 'assets/img/mocks/stories/geometria.png' },
};

// Teaser sin portada propia → imagery sample (3 portadas de historias).
export const storylistTeaserSampleMock: StorylistTeaser = {
	...storylistTeaserRepresentativeMock,
	_id: 'cuentoneta-11',
	slug: 'primavera-2022',
	title: 'La Cuentoneta 1.1',
	imagery: {
		kind: 'sample',
		images: [
			'assets/img/mocks/stories/el-odio.png',
			'assets/img/mocks/stories/las-escaleras.png',
			'assets/img/mocks/stories/geometria.png',
		],
	},
};

export const storylistNavigationTeaserMock: StorylistStoriesNavigationTeasers = {
	_id: 'cuentoneta-10',
	title: 'La Cuentoneta 1.0"',
	slug: 'verano-2022',
	count: 1,
	media: [],
	tabs: [],
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
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/production/edd62a3131bd1f46e796e473d0b2b12d1c63c229-1024x1536.png',
	tags: [tagMock],
	config: {
		showAuthors: true,
	},
	stories: [storyNavigationTeaserWithAuthor],
};
