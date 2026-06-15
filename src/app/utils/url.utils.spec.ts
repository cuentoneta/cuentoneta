import { normalizeBaseUrl } from './url.utils';

describe('normalizeBaseUrl', () => {
	it('should strip a single trailing slash', () => {
		expect(normalizeBaseUrl('https://cuentoneta.ar/')).toBe('https://cuentoneta.ar');
	});

	it('should strip multiple trailing slashes', () => {
		expect(normalizeBaseUrl('https://cuentoneta.ar///')).toBe('https://cuentoneta.ar');
	});

	it('should leave a url without trailing slash unchanged', () => {
		expect(normalizeBaseUrl('https://cuentoneta.ar')).toBe('https://cuentoneta.ar');
	});

	it('should reduce the dev root "/" to an empty string', () => {
		expect(normalizeBaseUrl('/')).toBe('');
	});
});
