import { createLiteraryWork, createLiteraryWorkCatalogEntry, isAnonymous } from './literary-work.model';
import type { CatalogEntry } from './catalog.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from './literary-work-section.model';
import { createReadingTime } from './reading-time.model';
import { createSanitizedHtml } from './sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { authorMock } from '@mocks/author.mock';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';

function buildSection(position: number, minutes: number): LiteraryWorkSection {
	return createLiteraryWorkSection({
		position,
		bodyHtml: createSanitizedHtml('<p>Cuerpo.</p>'),
		readingTime: createReadingTime(minutes),
	});
}

const anonymousAuthor = { ...authorMock, slug: 'anonimo', name: 'Anónimo' };

function buildOptions(overrides: Partial<Parameters<typeof createLiteraryWork>[0]> = {}) {
	return {
		_id: 'lw-1',
		slug: 'la-obra',
		title: 'La obra',
		authors: [anonymousAuthor],
		coverImage: '',
		content: [buildSection(0, 2)],
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

	it('derives totalReadingTime and sectionCount from its sections', () => {
		const work = createLiteraryWork(
			buildOptions({ content: [buildSection(0, 2), buildSection(1, 3), buildSection(2, 1)] }),
		);

		expect(work.totalReadingTime).toBe(6);
		expect(work.sectionCount).toBe(3);
	});

	it('throws when section positions do not match their array index', () => {
		expect(() => createLiteraryWork(buildOptions({ content: [buildSection(1, 2)] }))).toThrow(
			'LiteraryWork inválida: posiciones de sección no contiguas (slug "la-obra", índice 0 con position 1)',
		);
	});

	it('builds an anonymous work when its only author is Anónimo', () => {
		const work = createLiteraryWork(buildOptions({ authors: [anonymousAuthor] }));

		expect(work.authors).toHaveLength(1);
		expect(isAnonymous(work.authors)).toBe(true);
	});

	it('accepts multiple authors', () => {
		const work = createLiteraryWork(buildOptions({ authors: [authorMock, authorMock] }));

		expect(work.authors).toHaveLength(2);
		expect(isAnonymous(work.authors)).toBe(false);
	});

	it('throws when there are no authors', () => {
		expect(() => createLiteraryWork(buildOptions({ authors: [] }))).toThrow(
			'LiteraryWork inválida: sin autores (slug "la-obra") — la obra anónima referencia al author "Anónimo"',
		);
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

	it('keeps the editorial note in the frozen aggregate when the work has one', () => {
		const editorialNote = createSanitizedHtml('<p>Nota editorial de la obra.</p>');

		const work = createLiteraryWork(buildOptions({ editorialNote }));

		expect(work.editorialNote).toBe(editorialNote);
	});

	it('leaves the editorial note undefined when the work has none', () => {
		const work = createLiteraryWork(buildOptions());

		expect(work.editorialNote).toBeUndefined();
	});

	it('delegates slug format validation to the Slug value object', () => {
		expect(() => createLiteraryWork(buildOptions({ slug: 'La Obra' }))).toThrow('Slug inválido: "La Obra"');
	});
});

describe('isAnonymous', () => {
	it('returns true when every author is Anónimo', () => {
		expect(isAnonymous([{ slug: 'anonimo' }])).toBe(true);
	});

	it('returns false when there is at least one real author', () => {
		expect(isAnonymous([{ slug: 'jorge-luis-borges' }])).toBe(false);
		expect(isAnonymous([{ slug: 'anonimo' }, { slug: 'jorge-luis-borges' }])).toBe(false);
	});

	it('returns false for an empty array (not a valid aggregate state)', () => {
		expect(isAnonymous([])).toBe(false);
	});
});

describe('createLiteraryWorkCatalogEntry', () => {
	const [canonWork] = onoffLiteraryWorksMock.filter((literaryWork) => literaryWork.tags.length > 0);

	function buildCatalogEntryOptions(overrides: Partial<Parameters<typeof createLiteraryWorkCatalogEntry>[0]> = {}) {
		return {
			slug: canonWork.slug,
			title: canonWork.title,
			authors: canonWork.authors,
			totalReadingTime: canonWork.totalReadingTime,
			tags: canonWork.tags,
			...overrides,
		};
	}

	it('builds a frozen literary work entry with exactly the contract properties', () => {
		const entry: CatalogEntry = createLiteraryWorkCatalogEntry(buildCatalogEntryOptions());

		expect(Object.isFrozen(entry)).toBe(true);
		expect(entry.kind).toBe('literaryWork');
		expect(entry.slug).toBe(canonWork.slug);
		expect(Object.keys(entry).sort()).toEqual(['authors', 'kind', 'slug', 'tags', 'title', 'totalReadingTime']);
	});

	it('keeps only the slug and name of each full author it receives', () => {
		const entry = createLiteraryWorkCatalogEntry(buildCatalogEntryOptions());

		expect(entry.authors).toEqual(canonWork.authors.map(({ slug, name }) => ({ slug, name })));
		entry.authors.forEach((author) => expect(Object.keys(author).sort()).toEqual(['name', 'slug']));
	});

	it('keeps only the slug and title of each full tag it receives', () => {
		const entry = createLiteraryWorkCatalogEntry(buildCatalogEntryOptions());

		expect(entry.tags).toEqual(canonWork.tags.map(({ slug, title }) => ({ slug, title })));
		entry.tags.forEach((tag) => expect(Object.keys(tag).sort()).toEqual(['slug', 'title']));
	});

	it.each(['', '   '])('throws on an empty title (%j) naming the slug', (title) => {
		expect(() => createLiteraryWorkCatalogEntry(buildCatalogEntryOptions({ title }))).toThrow(
			`LiteraryWorkCatalogEntry inválida: título vacío (slug "${canonWork.slug}")`,
		);
	});

	it('throws when there are no authors, naming Anónimo', () => {
		expect(() => createLiteraryWorkCatalogEntry(buildCatalogEntryOptions({ authors: [] }))).toThrow(
			`LiteraryWorkCatalogEntry inválida: sin autores (slug "${canonWork.slug}") — la obra anónima referencia al author "Anónimo"`,
		);
	});

	it('delegates slug format validation to the Slug value object', () => {
		const slug = canonWork.slug.toUpperCase();

		expect(() => createLiteraryWorkCatalogEntry(buildCatalogEntryOptions({ slug }))).toThrow(
			`Slug inválido: "${slug}"`,
		);
	});

	it('accepts a work without tags', () => {
		const entry = createLiteraryWorkCatalogEntry(buildCatalogEntryOptions({ tags: [] }));

		expect(entry.tags).toEqual([]);
	});
});
