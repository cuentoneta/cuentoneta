import { HISTORICAL_YEAR_RANGE, parseHistoricalDate, yearOfHistoricalDate } from './historical-date.utils';

describe('parseHistoricalDate', () => {
	it('splits a CE date into its parts', () => {
		expect(parseHistoricalDate('1948-01-02')).toEqual({
			year: 1948,
			yearDigits: '1948',
			month: '01',
			day: '02',
			isBce: false,
		});
	});

	it('keeps the historical numbering for a BCE date', () => {
		expect(parseHistoricalDate('-0043-03-20')).toEqual({
			year: -43,
			yearDigits: '0043',
			month: '03',
			day: '20',
			isBce: true,
		});
	});

	it.each(['', '1948-1-1', '1948/01/01', '48-01-01', '1948-01-01T00:00:00Z', ' 1948-01-01'])(
		'returns undefined for the malformed value %j',
		(value) => {
			expect(parseHistoricalDate(value)).toBeUndefined();
		},
	);

	it('does not validate range or calendar', () => {
		expect(parseHistoricalDate('0000-01-01')?.year).toBe(0);
		expect(parseHistoricalDate('9999-02-31')?.year).toBe(9999);
	});
});

describe('yearOfHistoricalDate', () => {
	it.each([undefined, null, ''])('returns undefined when there is no date (%j)', (value) => {
		expect(yearOfHistoricalDate(value)).toBeUndefined();
	});

	it.each(['1948-1-1', '1948/01/01', 'abc'])('returns undefined for the malformed date %j', (value) => {
		expect(yearOfHistoricalDate(value)).toBeUndefined();
	});

	it('returns undefined for the year 0, which does not exist in historical numbering', () => {
		expect(yearOfHistoricalDate('0000-01-01')).toBeUndefined();
		expect(yearOfHistoricalDate('-0000-01-01')).toBeUndefined();
	});

	it('returns the year of a CE date', () => {
		expect(yearOfHistoricalDate('1948-01-01')).toBe(1948);
	});

	it('returns a negative year for a BCE date, without astronomical shift', () => {
		expect(yearOfHistoricalDate('-0043-03-20')).toBe(-43);
		expect(yearOfHistoricalDate('-0001-12-31')).toBe(-1);
	});

	it('accepts the exact limits of the range', () => {
		expect(yearOfHistoricalDate('-3000-01-01')).toBe(HISTORICAL_YEAR_RANGE.min);
		expect(yearOfHistoricalDate('2100-12-31')).toBe(HISTORICAL_YEAR_RANGE.max);
	});

	it('returns undefined outside the range', () => {
		expect(yearOfHistoricalDate('-3001-01-01')).toBeUndefined();
		expect(yearOfHistoricalDate('2101-01-01')).toBeUndefined();
	});
});
