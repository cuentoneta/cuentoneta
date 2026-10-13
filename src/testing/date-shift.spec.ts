import { shiftDays } from './date-shift';

describe('shiftDays', () => {
	it.each([
		['2026-08-31', 1, '2026-09-01'],
		['2026-09-01', -1, '2026-08-31'],
		['2026-12-31', 1, '2027-01-01'],
		['2028-02-28', 1, '2028-02-29'],
		['2026-08-31', 0, '2026-08-31'],
	] as const)('shifts %s by %i days to %s', (date, days, expected) => {
		expect(shiftDays(date, days)).toBe(expected);
	});
});
