import { describe, expect, it } from 'vitest';

import { validateHistoricalDate } from './validations';

describe('validateHistoricalDate', () => {
	it('accepts an empty value: the field is optional', () => {
		expect(validateHistoricalDate()).toBe(true);
		expect(validateHistoricalDate('')).toBe(true);
	});

	it('accepts a well-formed date', () => {
		expect(validateHistoricalDate('1936-07-17')).toBe(true);
	});

	it('accepts a BC date, written with a leading minus', () => {
		expect(validateHistoricalDate('-0044-03-15')).toBe(true);
	});

	it('rejects a value that is not YYYY-MM-DD', () => {
		expect(validateHistoricalDate('17/07/1936')).toContain('Formato inválido');
		expect(validateHistoricalDate('1936-7-17')).toContain('Formato inválido');
		expect(validateHistoricalDate('1936-07')).toContain('Formato inválido');
	});

	it('rejects year 0: historical numbering goes from 1 BC to 1 AD', () => {
		expect(validateHistoricalDate('0000-01-01')).toContain('No existe el año 0');
		expect(validateHistoricalDate('-0000-01-01')).toContain('No existe el año 0');
	});

	it('rejects years outside the admitted range', () => {
		expect(validateHistoricalDate('-3001-01-01')).toContain('fuera de rango');
		expect(validateHistoricalDate('2101-01-01')).toContain('fuera de rango');
	});

	it('accepts the boundaries of the admitted range', () => {
		expect(validateHistoricalDate('-3000-01-01')).toBe(true);
		expect(validateHistoricalDate('2100-01-01')).toBe(true);
	});

	it('rejects a well-formed value that is not a real calendar date', () => {
		expect(validateHistoricalDate('1936-02-31')).toContain('Fecha calendario inválida');
		expect(validateHistoricalDate('1936-13-01')).toContain('Fecha calendario inválida');
	});

	it('resolves leap years against the year given, not the current one', () => {
		expect(validateHistoricalDate('2024-02-29')).toBe(true);
		expect(validateHistoricalDate('2023-02-29')).toContain('Fecha calendario inválida');
	});
});
