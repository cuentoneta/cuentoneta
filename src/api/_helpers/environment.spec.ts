import { CONSERVATIVE_READ_CACHE_S_MAXAGE, parseReadCacheSMaxAge } from './environment';

describe('parseReadCacheSMaxAge', () => {
	it('should return the value when it is a valid positive integer', () => {
		expect(parseReadCacheSMaxAge('600')).toBe(600);
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

	// `s-maxage` es delta-seconds entero por RFC 9111: un fraccionario invalida la directiva y el
	// borde deja de cachear sin avisar.
	it('should fall back to the conservative default for a fractional value', () => {
		expect(parseReadCacheSMaxAge('300.7')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});
});
