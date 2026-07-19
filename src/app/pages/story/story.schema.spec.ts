import { storyMock } from '@mocks/story.mock';

import { assertValidJsonLd, validateJsonLd } from '../../../../e2e/_utils/json-ld-validation';
import { buildStoryArticleSchema, buildStoryBreadcrumb } from './story.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('story schema builders', () => {
	it('buildStoryArticleSchema emite un Article schema.org válido', async () => {
		await expect(assertValidJsonLd(buildStoryArticleSchema(storyMock, websiteUrl))).resolves.toBeUndefined();
	});

	it('el Article lleva las señales E-E-A-T (author, datePublished, publisher)', () => {
		expect(buildStoryArticleSchema(storyMock, websiteUrl)).toMatchObject({
			'@type': 'Article',
			datePublished: storyMock.publishedAt,
			author: { '@type': 'Person' },
			publisher: { '@type': 'Organization' },
		});
	});

	it('un cuento sin fecha de publicación produce un Article inválido (lo atrapa la validación)', async () => {
		const schema = buildStoryArticleSchema({ ...storyMock, publishedAt: '' }, websiteUrl);
		expect((await validateJsonLd(schema)).map((violation) => violation.message).join(' ')).toContain('datePublished');
	});

	it('buildStoryBreadcrumb emite un BreadcrumbList schema.org válido', async () => {
		await expect(assertValidJsonLd(buildStoryBreadcrumb(storyMock, websiteUrl))).resolves.toBeUndefined();
	});
});
