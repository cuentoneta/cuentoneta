import { storyMock } from '@mocks/story.mock';

import { buildStoryArticleSchema } from './story.schema';

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
			image: 'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
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
