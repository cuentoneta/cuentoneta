import { buildCanonicalUrl } from './build-canonical-url.util';
import { environment } from '../environments/environment';

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

	it('should default the host to environment.website when the website argument is omitted', () => {
		expect(buildCanonicalUrl('story/el-aleph')).toBe(buildCanonicalUrl('story/el-aleph', environment.website));
	});

	it('should produce a root-relative URL when the host is just "/" (dev environment.website)', () => {
		expect(buildCanonicalUrl('story/el-aleph', '/')).toBe('/story/el-aleph');
	});
});
