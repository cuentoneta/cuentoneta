import { extractHostDirectiveNames, extractRobotsLiteral } from './seo-host-directives.util';

describe('seo-host-directives.util', () => {
	describe('extractHostDirectiveNames', () => {
		it('should extract the directive names from a single-line hostDirectives array', () => {
			const source = `hostDirectives: [HomeMetaTagsDirective, HomeStructuredDataDirective],`;
			expect(extractHostDirectiveNames(source)).toEqual(['HomeMetaTagsDirective', 'HomeStructuredDataDirective']);
		});

		it('should extract the directive names from a multi-line hostDirectives array', () => {
			const source = `
				hostDirectives: [
					AuthorMetaTagsDirective,
					AuthorStructuredDataDirective,
				],
			`;
			expect(extractHostDirectiveNames(source)).toEqual(['AuthorMetaTagsDirective', 'AuthorStructuredDataDirective']);
		});

		it('should extract a single directive name', () => {
			expect(extractHostDirectiveNames(`hostDirectives: [HeadMetadataDirective],`)).toEqual(['HeadMetadataDirective']);
		});

		it('should return an empty array when hostDirectives is absent', () => {
			expect(extractHostDirectiveNames(`@Component({ selector: 'cuentoneta-home' })`)).toEqual([]);
		});

		it('should return an empty array when the hostDirectives array is empty', () => {
			expect(extractHostDirectiveNames(`hostDirectives: [],`)).toEqual([]);
		});

		it('should tolerate a trailing comma inside the array', () => {
			expect(extractHostDirectiveNames(`hostDirectives: [HeadMetadataDirective,],`)).toEqual(['HeadMetadataDirective']);
		});
	});

	describe('extractRobotsLiteral', () => {
		it('should return the robots literal from a setRobots call', () => {
			expect(extractRobotsLiteral(`this.metaTagsDirective.setRobots('noindex, follow');`)).toBe('noindex, follow');
		});

		it('should return the index literal for an indexable page', () => {
			expect(extractRobotsLiteral(`setRobots('index, follow')`)).toBe('index, follow');
		});

		it('should accept double quotes', () => {
			expect(extractRobotsLiteral(`setRobots("noindex, nofollow")`)).toBe('noindex, nofollow');
		});

		it('should return undefined when there is no setRobots call', () => {
			expect(extractRobotsLiteral(`hostDirectives: [HomeMetaTagsDirective]`)).toBeUndefined();
		});
	});
});
