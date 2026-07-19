import { collectSeoViolations, extractHostDirectiveNames, extractRobotsLiteral } from './seo-host-directives.util';

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

	describe('collectSeoViolations', () => {
		const indexableSource = `hostDirectives: [HomeMetaTagsDirective, HomeStructuredDataDirective],`;
		const noindexSource = `hostDirectives: [HeadMetadataDirective],\nsetRobots('noindex, follow');`;

		it('should report no violations for a conformant indexable page', () => {
			expect(collectSeoViolations(true, indexableSource)).toEqual([]);
		});

		it('should report no violations for a conformant noindex page', () => {
			expect(collectSeoViolations(false, noindexSource)).toEqual([]);
		});

		it('should flag an indexable page missing the StructuredData directive', () => {
			const violations = collectSeoViolations(true, `hostDirectives: [HomeMetaTagsDirective],`);
			expect(violations).toHaveLength(1);
			expect(violations[0]).toContain('StructuredDataDirective');
		});

		it('should flag an indexable page missing both SEO directives', () => {
			expect(collectSeoViolations(true, `hostDirectives: [HeadMetadataDirective],`)).toHaveLength(2);
		});

		it('should flag a noindex page that declares the indexable combo', () => {
			const violations = collectSeoViolations(false, indexableSource);
			expect(violations.some((v) => v.includes('HeadMetadataDirective'))).toBe(true);
			expect(violations.some((v) => v.includes('setRobots'))).toBe(true);
		});

		it('should flag a noindex page with an extra host directive', () => {
			const violations = collectSeoViolations(
				false,
				`hostDirectives: [HeadMetadataDirective, FooDirective],\nsetRobots('noindex, follow');`,
			);
			expect(violations).toHaveLength(1);
			expect(violations[0]).toContain('HeadMetadataDirective');
		});

		it('should flag a noindex page that never calls setRobots(noindex)', () => {
			const violations = collectSeoViolations(false, `hostDirectives: [HeadMetadataDirective],`);
			expect(violations).toHaveLength(1);
			expect(violations[0]).toContain('setRobots');
		});
	});
});
