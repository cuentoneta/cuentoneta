import { createIsoDateTime } from './date.utils';

describe('createIsoDateTime', () => {
	it('returns the value branded as IsoDateTime when it is a full ISO datetime', () => {
		expect(createIsoDateTime('2022-01-25T23:26:34Z')).toBe('2022-01-25T23:26:34Z');
		expect(createIsoDateTime('2026-07-22T10:00:00.000-03:00')).toBe('2026-07-22T10:00:00.000-03:00');
	});

	it('throws on a date without time', () => {
		expect(() => createIsoDateTime('2022-01-25')).toThrow('IsoDateTime inválida: "2022-01-25"');
	});

	it('throws on a malformed value', () => {
		expect(() => createIsoDateTime('ayer a la tarde')).toThrow('IsoDateTime inválida: "ayer a la tarde"');
		expect(() => createIsoDateTime('')).toThrow('IsoDateTime inválida: ""');
	});
});
