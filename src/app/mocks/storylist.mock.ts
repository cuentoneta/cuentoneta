import { Storylist, StorylistStoriesNavigationTeasers } from '@models/storylist.model';
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
	coverImages: [],
	tags: [tagMock],
	config: {
		showAuthors: true,
	},
	stories: [storyNavigationTeaserWithAuthor],
};

// Portadas de ejemplo (imágenes de autores) para ejercitar la variante Multiple del CollectionTeaser.
export const collectionCoverImagesMock: string[] = [
	'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
	'https://cdn.sanity.io/images/s4dbqkc5/production/edd62a3131bd1f46e796e473d0b2b12d1c63c229-1024x1536.png',
	'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
];

// Una de las 3 portadas vacía ('') para ejercitar el placeholder de CoverImage dentro del abanico.
export const collectionCoverImagesWithGapMock: string[] = [
	'https://cdn.sanity.io/images/s4dbqkc5/production/edd62a3131bd1f46e796e473d0b2b12d1c63c229-1024x1536.png',
	'',
	'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
];

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
	coverImages: [],
	tags: [tagMock],
	config: {
		showAuthors: true,
	},
	stories: [storyNavigationTeaserWithAuthor],
};
