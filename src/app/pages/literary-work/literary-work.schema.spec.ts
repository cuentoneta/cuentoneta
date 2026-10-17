import { onoffImageAssets } from '@mocks/onoff-image-assets.mock';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { cdnUrlFor, cdnUrlForCorpusPath } from '@testing/sanity-cdn-url';
import { buildLiteraryWorkArticleSchema, buildLiteraryWorkBreadcrumb } from './literary-work.schema';

const WEBSITE = 'https://test.cuentoneta.ar';

const [representativeLiteraryWork] = onoffLiteraryWorksMock;

describe('read.schema', () => {
	describe('buildLiteraryWorkArticleSchema', () => {
		it('construye un Article válido según schema.org', async () => {
			await expect(
				assertValidJsonLd(buildLiteraryWorkArticleSchema(representativeLiteraryWork, WEBSITE)),
			).resolves.toBeUndefined();
		});

		it.each(onoffLiteraryWorksMock)('construye un Article con headline y mainEntity de "$slug"', (literaryWork) => {
			const article = buildLiteraryWorkArticleSchema(literaryWork, WEBSITE);

			expect(article['@type']).toBe('Article');
			expect(article.headline).toBe(literaryWork.title);
			expect(article.mainEntityOfPage).toBe(`${WEBSITE}/literary-work/${literaryWork.slug}`);
		});

		it.each(onoffLiteraryWorksMock)('emite un Person por autor de "$slug"', (literaryWork) => {
			const article = buildLiteraryWorkArticleSchema(literaryWork, WEBSITE);

			const authors = Array.isArray(article.author) ? article.author : [article.author];
			expect(authors).toHaveLength(literaryWork.authors.length);
			expect(authors[0]).toMatchObject({ '@type': 'Person', name: literaryWork.authors[0].name });
		});

		it.each(onoffLiteraryWorksMock)('declara como image el JPG de la portada raster de "$slug"', (literaryWork) => {
			const coverImage = cdnUrlForCorpusPath(literaryWork.coverImage);

			const article = buildLiteraryWorkArticleSchema({ ...literaryWork, coverImage }, WEBSITE);

			expect(article.image).toBe(`${coverImage}?fm=jpg`);
		});

		it('sigue siendo un Article válido con image', async () => {
			const coverImage = cdnUrlForCorpusPath(representativeLiteraryWork.coverImage);

			await expect(
				assertValidJsonLd(buildLiteraryWorkArticleSchema({ ...representativeLiteraryWork, coverImage }, WEBSITE)),
			).resolves.toBeUndefined();
		});

		it.each([
			// Por debajo del área mínima que Google admite para la imagen de un Article.
			{ cover: 'una portada raster chica', coverImage: cdnUrlFor(onoffImageAssets.franceFlag) },
			{
				cover: 'una portada sin dimensiones en la URL',
				coverImage: cdnUrlForCorpusPath(representativeLiteraryWork.coverImage).replace(/-\d+x\d+/, ''),
			},
			{
				cover: 'una portada SVG',
				coverImage: cdnUrlForCorpusPath(representativeLiteraryWork.coverImage).replace(/\.\w+$/, '.svg'),
			},
			{ cover: 'la portada local del corpus', coverImage: representativeLiteraryWork.coverImage },
			{ cover: 'sin portada', coverImage: '' },
		])('omite image con $cover', ({ coverImage }) => {
			const article = buildLiteraryWorkArticleSchema({ ...representativeLiteraryWork, coverImage }, WEBSITE);

			expect('image' in article).toBe(false);
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
		it('construye un BreadcrumbList válido según schema.org', async () => {
			await expect(
				assertValidJsonLd(buildLiteraryWorkBreadcrumb(representativeLiteraryWork, WEBSITE)),
			).resolves.toBeUndefined();
		});

		it.each(onoffLiteraryWorksMock)('construye un BreadcrumbList de 2 niveles para "$slug"', (literaryWork) => {
			const breadcrumb = buildLiteraryWorkBreadcrumb(literaryWork, WEBSITE);

			expect(breadcrumb['@type']).toBe('BreadcrumbList');
			expect(breadcrumb.itemListElement).toHaveLength(2);
		});

		it('ancla el primer nivel en la raíz, que es la URL canónica de la portada', () => {
			const breadcrumb = buildLiteraryWorkBreadcrumb(representativeLiteraryWork, `${WEBSITE}/`);

			expect(breadcrumb.itemListElement).toContainEqual({
				'@type': 'ListItem',
				position: 1,
				name: 'Inicio',
				item: { '@id': `${WEBSITE}/` },
			});
		});
	});
});
