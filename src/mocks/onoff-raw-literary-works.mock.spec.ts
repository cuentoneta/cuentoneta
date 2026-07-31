import {
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	unmaterializedRawLiteraryWork,
} from './onoff-raw-literary-works.mock';

describe('onoffRawLiteraryWorksMock (corpus raw de LiteraryWork)', () => {
	it('should carry at least one author per work', () => {
		for (const rawLiteraryWork of onoffRawLiteraryWorksMock) {
			expect(rawLiteraryWork.authors.length).toBeGreaterThanOrEqual(1);
		}
	});

	it('should keep sectionCount coherent with the transported content length', () => {
		for (const rawLiteraryWork of onoffRawLiteraryWorksMock) {
			expect(rawLiteraryWork.sectionCount).toBe(rawLiteraryWork.content.length);
		}
	});

	it('should have a populated readingTime per section', () => {
		for (const rawLiteraryWork of onoffRawLiteraryWorksMock) {
			for (const section of rawLiteraryWork.content) {
				expect(section.readingTime).not.toBeNull();
			}
		}
	});

	it('should carry the editorial note as non-empty markdown, or null when the work has none', () => {
		for (const { slug, editorialNote } of onoffRawLiteraryWorksMock) {
			expect({ slug, editorialNote: editorialNote?.trim() }).toEqual({
				slug,
				editorialNote: editorialNote === null ? undefined : expect.stringMatching(/\S/),
			});
		}
	});

	// Ambas ramas del campo opcional tienen que estar representadas: sin una obra sin nota, la rama
	// `undefined` del mapper y del render dejaría de ejercitarse contra el corpus.
	it('should cover both the works with an editorial note and the ones without it', () => {
		const notes = onoffRawLiteraryWorksMock.map((rawLiteraryWork) => rawLiteraryWork.editorialNote);

		expect(notes.some((editorialNote) => editorialNote !== null)).toBe(true);
		expect(notes.some((editorialNote) => editorialNote === null)).toBe(true);
	});
});

describe('multiSectionRawLiteraryWork (escenario de borde: obra multi-sección)', () => {
	it('should carry more than one section, with sectionCount matching content length', () => {
		expect(multiSectionRawLiteraryWork.sectionCount).toBeGreaterThan(1);
		expect(multiSectionRawLiteraryWork.sectionCount).toBe(multiSectionRawLiteraryWork.content.length);
	});
});

describe('unmaterializedRawLiteraryWork (escenario de borde: sin reading time persistido)', () => {
	it('should carry a null totalReadingTime', () => {
		expect(unmaterializedRawLiteraryWork.totalReadingTime).toBeNull();
	});

	it('should carry a null readingTime in every section', () => {
		for (const section of unmaterializedRawLiteraryWork.content) {
			expect(section.readingTime).toBeNull();
		}
	});
});
