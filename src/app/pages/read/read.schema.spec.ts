import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { buildLiteraryWorkArticleSchema, buildLiteraryWorkBreadcrumb } from './read.schema';

const WEBSITE = 'https://test.cuentoneta.ar';

describe('read.schema', () => {
	describe('buildLiteraryWorkArticleSchema', () => {
		it.each(onoffLiteraryWorksMock)('construye un Article con headline y mainEntity de "$slug"', (literaryWork) => {
			const article = buildLiteraryWorkArticleSchema(literaryWork, WEBSITE);

			expect(article['@type']).toBe('Article');
			expect(article.headline).toBe(literaryWork.title);
			expect(article.mainEntityOfPage).toBe(`${WEBSITE}/read/${literaryWork.slug}`);
		});

		it.each(onoffLiteraryWorksMock)('emite un Person por autor de "$slug"', (literaryWork) => {
			const article = buildLiteraryWorkArticleSchema(literaryWork, WEBSITE);

			const authors = Array.isArray(article.author) ? article.author : [article.author];
			expect(authors).toHaveLength(literaryWork.authors.length);
			expect(authors[0]).toMatchObject({ '@type': 'Person', name: literaryWork.authors[0].name });
		});

		it.each(onoffLiteraryWorksMock)(
			'omite dateModified para "$slug" (LiteraryWork no tiene updatedAt)',
			(literaryWork) => {
				const article = buildLiteraryWorkArticleSchema(literaryWork, WEBSITE);

				expect('dateModified' in article).toBe(false);
			},
		);
	});

	describe('buildLiteraryWorkBreadcrumb', () => {
		it.each(onoffLiteraryWorksMock)('construye un BreadcrumbList de 2 niveles para "$slug"', (literaryWork) => {
			const breadcrumb = buildLiteraryWorkBreadcrumb(literaryWork, WEBSITE);

			expect(breadcrumb['@type']).toBe('BreadcrumbList');
			expect(breadcrumb.itemListElement).toHaveLength(2);
		});
	});
});
