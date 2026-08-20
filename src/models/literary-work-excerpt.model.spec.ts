import { createLiteraryWorkExcerpt } from './literary-work-excerpt.model';
import { createSectionTitle } from './section-title.model';
import { createSanitizedHtml } from './sanitized-html.model';

describe('createLiteraryWorkExcerpt', () => {
	const bodyHtml = createSanitizedHtml('<p>Arranque de la sección de apertura.</p>');

	it('builds a minimal excerpt without title', () => {
		const excerpt = createLiteraryWorkExcerpt({ bodyHtml });

		expect(excerpt.bodyHtml).toBe(bodyHtml);
		expect(excerpt.title).toBeUndefined();
	});

	it('builds an excerpt with the opening section title', () => {
		const excerpt = createLiteraryWorkExcerpt({ title: createSectionTitle('Capítulo Uno'), bodyHtml });

		expect(excerpt.title?.value).toBe('Capítulo Uno');
	});

	it('freezes the excerpt', () => {
		const excerpt = createLiteraryWorkExcerpt({ bodyHtml });

		expect(Object.isFrozen(excerpt)).toBe(true);
	});

	// La ausencia de estos dos campos es el mecanismo que impide reintroducir la cascada por la que el
	// tiempo de lectura de una obra terminaba derivándose de un extracto. Se afirma, no se confía.
	it('does not expose reading time nor position', () => {
		const excerpt = createLiteraryWorkExcerpt({ bodyHtml });

		expect(excerpt).not.toHaveProperty('readingTime');
		expect(excerpt).not.toHaveProperty('position');
	});
});
