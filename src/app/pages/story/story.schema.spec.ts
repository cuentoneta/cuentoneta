import { storyMock } from '@mocks/story.mock';

import { buildStoryArticleSchema, buildStoryBreadcrumb } from './story.schema';

describe('buildStoryArticleSchema', () => {
	// URL con barra final como la que llega en producción; el builder debe normalizarla.
	const websiteUrl = 'https://www.cuentoneta.ar/';

	it('should build an Article with E-E-A-T dates and normalized urls', () => {
		const schema = buildStoryArticleSchema(storyMock, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: 'El espejo del tiempo',
			inLanguage: 'es-AR',
			datePublished: '2024-03-15T09:00:00Z',
			dateModified: '2024-05-20T10:30:00Z',
			mainEntityOfPage: 'https://www.cuentoneta.ar/story/el-espejo-del-tiempo',
			publisher: {
				'@type': 'Organization',
				name: 'La Cuentoneta',
				url: 'https://www.cuentoneta.ar',
				logo: 'https://www.cuentoneta.ar/assets/svg/logo.svg',
			},
		});
	});

	it('should forward the ISO datetime dates verbatim (consistent format incl. the _createdAt fallback)', () => {
		// Cuando el CMS no tiene `publishedAt`, la query cae a `_createdAt`, también datetime ISO.
		const story = { ...storyMock, publishedAt: '2021-12-28T00:00:00Z', updatedAt: '2026-01-10T12:00:00Z' };

		const schema = buildStoryArticleSchema(story, websiteUrl);

		expect(schema).toMatchObject({
			datePublished: '2021-12-28T00:00:00Z',
			dateModified: '2026-01-10T12:00:00Z',
		});
	});

	it('should build the author Person with profile url, image and sameAs from resources', () => {
		const schema = buildStoryArticleSchema(storyMock, websiteUrl);

		expect(schema['author']).toEqual({
			'@type': 'Person',
			name: 'François Onoff',
			url: 'https://www.cuentoneta.ar/author/francois-onoff',
			image: 'assets/img/mocks/author/francois-onoff.png',
			sameAs: ['https://es.wikipedia.org/wiki/Francois_Onoff'],
		});
	});

	it('should omit Person image and sameAs when the author has none', () => {
		const author = { ...storyMock.author, resources: [], imageUrl: '' };

		const schema = buildStoryArticleSchema({ ...storyMock, author }, websiteUrl);

		expect(schema['author']).toEqual({
			'@type': 'Person',
			name: 'François Onoff',
			url: 'https://www.cuentoneta.ar/author/francois-onoff',
		});
	});
});

describe('buildStoryBreadcrumb', () => {
	it('should build the trail Inicio → Cuentos → story', () => {
		const schema = buildStoryBreadcrumb(storyMock, 'https://www.cuentoneta.ar/');

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.cuentoneta.ar/home' },
			{ '@type': 'ListItem', position: 2, name: 'Cuentos', item: 'https://www.cuentoneta.ar/story' },
			{
				'@type': 'ListItem',
				position: 3,
				name: 'El espejo del tiempo',
				item: 'https://www.cuentoneta.ar/story/el-espejo-del-tiempo',
			},
		]);
	});
});
