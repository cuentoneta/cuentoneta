import { isValidDateString } from '@utils/date.utils';
import { isLeapYear } from '@utils/date.utils';

describe('isValidDateString', () => {
	it('should return true for valid date strings in YYYY-MM-DD format', () => {
		expect(isValidDateString('2023-10-05')).toBe(true);
		expect(isValidDateString('1999-01-01')).toBe(true);
	});

	it('should return false for invalid date strings with incorrect format', () => {
		expect(isValidDateString('05-10-2023')).toBe(false);
		expect(isValidDateString('2023/10/05')).toBe(false);
		expect(isValidDateString('20231005')).toBe(false);
	});

	it('should return false for strings with invalid date values', () => {
		expect(isValidDateString('2023-13-01')).toBe(false); // Invalid month
		expect(isValidDateString('2023-00-10')).toBe(false); // Invalid month
		expect(isValidDateString('2023-02-30')).toBe(false); // Invalid day
	});

	it('should return false for non-date strings', () => {
		expect(isValidDateString('random string')).toBe(false);
		expect(isValidDateString('')).toBe(false);
		expect(isValidDateString('1234')).toBe(false);
	});
});

describe('isLeapYear', () => {
	it('should return true for leap years divisible by 4 but not 100', () => {
		expect(isLeapYear(2024)).toBe(true);
		expect(isLeapYear(2008)).toBe(true);
	});

	it('should return false for years divisible by 100 but not 400', () => {
		expect(isLeapYear(1900)).toBe(false);
		expect(isLeapYear(2100)).toBe(false);
	});

	it('should return true for years divisible by 400', () => {
		expect(isLeapYear(2000)).toBe(true);
		expect(isLeapYear(1600)).toBe(true);
	});

	it('should return false for non-leap years not divisible by 4', () => {
		expect(isLeapYear(2023)).toBe(false);
		expect(isLeapYear(2019)).toBe(false);
	});
});
