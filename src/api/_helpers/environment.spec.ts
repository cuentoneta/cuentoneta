import { CONSERVATIVE_READ_CACHE_S_MAXAGE, parseReadCacheSMaxAge } from './environment';

describe('parseReadCacheSMaxAge', () => {
	it('devuelve el valor cuando es un entero positivo válido', () => {
		expect(parseReadCacheSMaxAge('31536000')).toBe(31536000);
	});

	it('cae al default conservador cuando la variable está ausente', () => {
		expect(parseReadCacheSMaxAge(undefined)).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});

	it('cae al default conservador ante un valor no numérico', () => {
		expect(parseReadCacheSMaxAge('un-año')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});

	it('cae al default conservador ante un valor no positivo', () => {
		expect(parseReadCacheSMaxAge('-5')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
		expect(parseReadCacheSMaxAge('0')).toBe(CONSERVATIVE_READ_CACHE_S_MAXAGE);
	});
});
