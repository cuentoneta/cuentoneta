import { CONSERVATIVE_READ_CACHE_S_MAXAGE, parseReadCacheSMaxAge } from './environment';

describe('parseReadCacheSMaxAge', () => {
	it('should return the value when it is a valid positive integer', () => {
		expect(parseReadCacheSMaxAge('31536000')).toBe(31536000);
	});

	it('should fall back to the conservative default when the variable is absent', () => {
		expect(parseReadCacheSMaxAge(undefined)).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});

	it('should fall back to the conservative default for a non-numeric value', () => {
		expect(parseReadCacheSMaxAge('un-año')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});

	it('should fall back to the conservative default for a non-positive value', () => {
		expect(parseReadCacheSMaxAge('-5')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
		expect(parseReadCacheSMaxAge('0')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});
});
