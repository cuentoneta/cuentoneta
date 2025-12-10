import { Storylist, StorylistPublicationsNavigationTeasers } from '@models/storylist.model';
import { tagMock } from './tag.mocks';
import { publicationMock, publicationNavigationTeaserMock } from './story.mock';

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
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/production/d1a7fc995e0a4d640c9d8e98fb56f56f209f3d89-392x318.webp',
	tags: [tagMock],
	publications: [publicationMock],
};

export const storylistNavigationTeaserMock: StorylistPublicationsNavigationTeasers = {
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
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/production/d1a7fc995e0a4d640c9d8e98fb56f56f209f3d89-392x318.webp',
	tags: [tagMock],
	publications: [publicationNavigationTeaserMock],
};
