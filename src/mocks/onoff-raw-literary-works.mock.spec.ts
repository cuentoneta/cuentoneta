import {
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	onoffRawLiteraryWorksWithEpigraphs,
	onoffRawLiteraryWorksWithoutTags,
	onoffRawLiteraryWorksWithTags,
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

	// Toda obra declara su tipo literario en `tags[0]`, que es lo que los componentes toman como etiqueta
	// principal. Sin esta invariante, dejar una obra sin etiquetas pasa sin ruido y se lleva puesta la
	// cobertura de las que solo ella carga.
	it('should declare tags on every work of the canon', () => {
		for (const { slug, tags } of onoffRawLiteraryWorksMock) {
			expect({ slug, hasTags: tags.length > 0 }).toEqual({ slug, hasTags: true });
		}
	});

	// Ambas ramas del mapeo de etiquetas tienen que estar representadas. La rama sin etiquetas no sale
	// del canon —ninguna obra queda sin ellas— sino de una variante construida para eso.
	it('should cover both the works with tags and the ones without them', () => {
		expect(onoffRawLiteraryWorksWithTags.length).toBeGreaterThan(0);
		expect(onoffRawLiteraryWorksWithoutTags.length).toBeGreaterThan(0);
	});

	// La obra enriquecida trae título de sección y epígrafe juntos: un raw con epígrafes pero sin
	// título quedaría desalineado con su mock de dominio homónimo (que lleva ambos).
	it('should keep every epigraph-bearing section titled (aligned with its domain mock)', () => {
		expect(onoffRawLiteraryWorksWithEpigraphs.length).toBeGreaterThan(0);

		for (const rawLiteraryWork of onoffRawLiteraryWorksWithEpigraphs) {
			for (const section of rawLiteraryWork.content) {
				if (section.epigraphs.length > 0) {
					expect(section.title).not.toBeNull();
				}
			}
		}
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
