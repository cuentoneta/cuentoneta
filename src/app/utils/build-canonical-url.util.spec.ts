import { buildCanonicalUrl } from './build-canonical-url.util';
import { environment } from '../environments/environment';

describe('buildCanonicalUrl', () => {
	it('should join host and path with a single slash when the host has no trailing slash', () => {
		expect(buildCanonicalUrl('literary-work/el-fin', 'https://www.cuentoneta.ar')).toBe(
			'https://www.cuentoneta.ar/literary-work/el-fin',
		);
	});

	it('should not produce a double slash when the host already has a trailing slash', () => {
		expect(buildCanonicalUrl('literary-work/el-fin', 'https://www.cuentoneta.ar/')).toBe(
			'https://www.cuentoneta.ar/literary-work/el-fin',
		);
	});

	it('should trim a leading slash from the path', () => {
		expect(buildCanonicalUrl('/author/borges', 'https://www.cuentoneta.ar')).toBe(
			'https://www.cuentoneta.ar/author/borges',
		);
	});

	it('should collapse multiple trailing/leading slashes into a single separator', () => {
		expect(buildCanonicalUrl('//collection/terror', 'https://www.cuentoneta.ar//')).toBe(
			'https://www.cuentoneta.ar/collection/terror',
		);
	});

	it('should default the host to environment.website when the website argument is omitted', () => {
		expect(buildCanonicalUrl('literary-work/el-fin')).toBe(
			buildCanonicalUrl('literary-work/el-fin', environment.website),
		);
	});

	// La portada se sirve en la raíz: su canónica es el host con una sola barra final, venga o no
	// `website` con ella.
	it.each(['https://www.cuentoneta.ar', 'https://www.cuentoneta.ar/'])(
		'should produce the root URL for an empty path with host %s',
		(website) => {
			expect(buildCanonicalUrl('', website)).toBe('https://www.cuentoneta.ar/');
		},
	);

	it('should produce a root-relative URL when the host is just "/" (dev environment.website)', () => {
		expect(buildCanonicalUrl('literary-work/el-fin', '/')).toBe('/literary-work/el-fin');
	});
});
