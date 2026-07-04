import { buildCanonicalUrl } from './build-canonical-url.util';

describe('buildCanonicalUrl', () => {
	it('should join host and path with a single slash when the host has no trailing slash', () => {
		expect(buildCanonicalUrl('story/el-aleph', 'https://www.cuentoneta.ar')).toBe(
			'https://www.cuentoneta.ar/story/el-aleph',
		);
	});

	it('should not produce a double slash when the host already has a trailing slash', () => {
		expect(buildCanonicalUrl('story/el-aleph', 'https://www.cuentoneta.ar/')).toBe(
			'https://www.cuentoneta.ar/story/el-aleph',
		);
	});

	it('should trim a leading slash from the path', () => {
		expect(buildCanonicalUrl('/author/borges', 'https://www.cuentoneta.ar')).toBe(
			'https://www.cuentoneta.ar/author/borges',
		);
	});

	it('should collapse multiple trailing/leading slashes into a single separator', () => {
		expect(buildCanonicalUrl('//storylist/terror', 'https://www.cuentoneta.ar//')).toBe(
			'https://www.cuentoneta.ar/storylist/terror',
		);
	});
});
