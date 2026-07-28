import {
	anonymousRawLiteraryWork,
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
});

describe('multiSectionRawLiteraryWork (escenario de borde: obra multi-sección)', () => {
	it('should carry more than one section, with sectionCount matching content length', () => {
		expect(multiSectionRawLiteraryWork.sectionCount).toBeGreaterThan(1);
		expect(multiSectionRawLiteraryWork.sectionCount).toBe(multiSectionRawLiteraryWork.content.length);
	});
});

describe('anonymousRawLiteraryWork (escenario de borde: obra recitada sin autoría real)', () => {
	it('should reference the "anonimo" author', () => {
		expect(anonymousRawLiteraryWork.authors[0].slug).toBe('anonimo');
	});

	it('should carry a hand-set totalReadingTime, distinct from the sum of its sections', () => {
		expect(anonymousRawLiteraryWork.totalReadingTime).not.toBeNull();
		expect(typeof anonymousRawLiteraryWork.totalReadingTime).toBe('number');
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
