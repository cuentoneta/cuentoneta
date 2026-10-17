import { createMarkdown } from '@models/markdown.model';
import { embeddedAuthorMock } from '@mocks/author.mock';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { htmlToPlainText } from '@utils/html-to-text.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import { buildAuthorMetaDescription, buildLiteraryWorkMetaDescription } from './meta-description.util';

// Un cuerpo que el pipeline convierte en HTML válido pero sin texto: lo que queda de una sección o una
// biografía sin prosa.
const htmlWithoutText = markdownToSanitizedHtml(createMarkdown('---'));

describe('buildAuthorMetaDescription', () => {
	it('should start with the plain text of the biography, within the length limit', () => {
		const description = buildAuthorMetaDescription(embeddedAuthorMock);
		const biography = htmlToPlainText(embeddedAuthorMock.biography);

		expect(description.length).toBeLessThanOrEqual(156);
		expect(description).not.toMatch(/<[^>]+>/);
		expect(biography.startsWith(description.replace(/…$/, ''))).toBe(true);
	});

	it('should differ between authors with different biographies', () => {
		const otherAuthor = { ...embeddedAuthorMock, biography: onoffLiteraryWorksMock[0].content[0].bodyHtml };

		expect(buildAuthorMetaDescription(otherAuthor)).not.toBe(buildAuthorMetaDescription(embeddedAuthorMock));
	});

	it('should fall back to the profile template when the biography has no text', () => {
		const author = { ...embeddedAuthorMock, biography: htmlWithoutText };

		expect(buildAuthorMetaDescription(author)).toBe(
			`Perfil y obras de ${embeddedAuthorMock.name} para leer en La Cuentoneta.`,
		);
	});
});

describe('buildLiteraryWorkMetaDescription', () => {
	it.each(onoffLiteraryWorksMock)(
		'should start with the body of "$title", without markup and within the length limit',
		(literaryWork) => {
			const description = buildLiteraryWorkMetaDescription(literaryWork);
			const body = htmlToPlainText(literaryWork.content[0].bodyHtml);

			expect(description.length).toBeLessThanOrEqual(156);
			expect(description).not.toMatch(/<[^>]+>/);
			expect(body.startsWith(description.replace(/…$/, ''))).toBe(true);
		},
	);

	it('should give each work of the corpus its own description', () => {
		const descriptions = onoffLiteraryWorksMock.map(buildLiteraryWorkMetaDescription);

		expect(new Set(descriptions).size).toBe(descriptions.length);
	});

	it('should skip leading sections without text', () => {
		const [literaryWork] = onoffLiteraryWorksMock;
		const [firstSection] = literaryWork.content;
		const withEmptyLead = {
			...literaryWork,
			content: [{ ...firstSection, bodyHtml: htmlWithoutText }, firstSection],
		};

		expect(buildLiteraryWorkMetaDescription(withEmptyLead)).toBe(buildLiteraryWorkMetaDescription(literaryWork));
	});

	it('should fall back to the generic description when no section has text', () => {
		const [literaryWork] = onoffLiteraryWorksMock;
		const withoutText = {
			...literaryWork,
			content: literaryWork.content.map((section) => ({ ...section, bodyHtml: htmlWithoutText })),
		};

		expect(buildLiteraryWorkMetaDescription(withoutText)).toBe(
			'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
		);
	});
});
