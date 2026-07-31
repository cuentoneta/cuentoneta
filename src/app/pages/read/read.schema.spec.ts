import { elOdioLiteraryWorkMock } from '@mocks/onoff/el-odio.mock';
import { buildLiteraryWorkArticleSchema, buildLiteraryWorkBreadcrumb } from './read.schema';

const WEBSITE = 'https://test.cuentoneta.ar';

describe('read.schema', () => {
	describe('buildLiteraryWorkArticleSchema', () => {
		const article = buildLiteraryWorkArticleSchema(elOdioLiteraryWorkMock, WEBSITE);

		it('construye un Article con el título de la obra como headline', () => {
			expect(article['@type']).toBe('Article');
			expect(article.headline).toBe(elOdioLiteraryWorkMock.title);
			expect(article.mainEntityOfPage).toBe(`${WEBSITE}/read/${elOdioLiteraryWorkMock.slug}`);
		});

		it('emite un Person por autor (multi-autor)', () => {
			const authors = Array.isArray(article.author) ? article.author : [article.author];
			expect(authors).toHaveLength(elOdioLiteraryWorkMock.authors.length);
			expect(authors[0]).toMatchObject({ '@type': 'Person', name: elOdioLiteraryWorkMock.authors[0].name });
		});

		it('omite dateModified (LiteraryWork no tiene updatedAt)', () => {
			expect('dateModified' in article).toBe(false);
		});
	});

	describe('buildLiteraryWorkBreadcrumb', () => {
		const breadcrumb = buildLiteraryWorkBreadcrumb(elOdioLiteraryWorkMock, WEBSITE);

		it('construye un BreadcrumbList de 2 niveles (Inicio → obra)', () => {
			expect(breadcrumb['@type']).toBe('BreadcrumbList');
			expect(breadcrumb.itemListElement).toHaveLength(2);
		});
	});
});
