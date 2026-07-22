import { createLiteraryWork, isAnonymous } from './literary-work.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from './literary-work-section.model';
import { createReadingTime } from './reading-time.model';
import { createSanitizedHtml } from './sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { authorMock } from '@mocks/author.mock';

function buildSection(minutes: number): LiteraryWorkSection {
	return createLiteraryWorkSection({
		bodyHtml: createSanitizedHtml('<p>Cuerpo.</p>'),
		readingTime: createReadingTime(minutes),
	});
}

function buildOptions(overrides: Partial<Parameters<typeof createLiteraryWork>[0]> = {}) {
	return {
		_id: 'lw-1',
		slug: 'la-obra',
		title: 'La obra',
		authors: [],
		coverImage: '',
		content: [buildSection(2)],
		mediaSources: [],
		resources: [],
		tags: [],
		originalPublication: '',
		publishedAt: createIsoDateTime('2026-07-22T00:00:00Z'),
		...overrides,
	};
}

describe('createLiteraryWork', () => {
	it('builds a frozen aggregate with a branded slug', () => {
		const work = createLiteraryWork(buildOptions());

		expect(work.slug).toBe('la-obra');
		expect(work.title).toBe('La obra');
		expect(Object.isFrozen(work)).toBe(true);
	});

	it('derives totalReadingTime as the sum of its sections', () => {
		const work = createLiteraryWork(buildOptions({ content: [buildSection(2), buildSection(3), buildSection(1)] }));

		expect(work.totalReadingTime).toBe(6);
	});

	it('accepts an empty authors array (anonymous work)', () => {
		const work = createLiteraryWork(buildOptions({ authors: [] }));

		expect(work.authors).toHaveLength(0);
		expect(isAnonymous(work.authors)).toBe(true);
	});

	it('accepts multiple authors', () => {
		const work = createLiteraryWork(buildOptions({ authors: [authorMock, authorMock] }));

		expect(work.authors).toHaveLength(2);
		expect(isAnonymous(work.authors)).toBe(false);
	});

	it('throws on an empty title', () => {
		expect(() => createLiteraryWork(buildOptions({ title: '   ' }))).toThrow(
			'LiteraryWork inválida: título vacío (slug "la-obra")',
		);
	});

	it('throws when there are no content sections', () => {
		expect(() => createLiteraryWork(buildOptions({ content: [] }))).toThrow(
			'LiteraryWork inválida: sin secciones de contenido (slug "la-obra")',
		);
	});

	it('delegates slug format validation to the Slug value object', () => {
		expect(() => createLiteraryWork(buildOptions({ slug: 'La Obra' }))).toThrow('Slug inválido: "La Obra"');
	});
});

describe('isAnonymous', () => {
	it('returns true for an empty authors array', () => {
		expect(isAnonymous([])).toBe(true);
	});

	it('returns false when there is at least one author', () => {
		expect(isAnonymous([{ name: 'Autora' }])).toBe(false);
	});
});
