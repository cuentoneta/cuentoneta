import { buildWeekSlug } from './week-slug.utils';

// Las fechas se construyen con el constructor local (año, mesIndex, día) y no con string ISO/UTC:
// date-fns opera en hora local, así que un `new Date('2024-12-30T00:00:00Z')` cae en otro día —y en
// otra semana— según la zona horaria del runner.
describe('buildWeekSlug', () => {
	it('formats the date as YYYY-WW', () => {
		expect(buildWeekSlug(new Date(2025, 10, 14))).toBe('2025-46');
	});

	it('labels the week with its ISO week-year, not the calendar year', () => {
		// 2024-12-30 es lunes: abre la semana ISO 01 de 2025 aunque el año calendario todavía sea 2024.
		expect(buildWeekSlug(new Date(2024, 11, 30))).toBe('2025-01');
	});

	it('uses ISO-8601 week numbering (Monday-start), not the locale default', () => {
		// 2023-01-01 es domingo: en ISO cierra la semana 52 de 2022; con la convención de domingo = día 1
		// sería la semana 1 de 2023.
		expect(buildWeekSlug(new Date(2023, 0, 1))).toBe('2022-52');
	});

	it('supports years with 53 ISO weeks', () => {
		expect(buildWeekSlug(new Date(2020, 11, 31))).toBe('2020-53');
	});

	it('pads the week number to two digits', () => {
		expect(buildWeekSlug(new Date(2026, 0, 1))).toBe('2026-01');
	});

	it('keeps lexicographic order aligned with chronological order across the Dec/Jan boundary', () => {
		// Invariante del que dependen las queries GROQ que comparan configs con `<=`.
		expect(buildWeekSlug(new Date(2025, 11, 22)) < buildWeekSlug(new Date(2026, 0, 5))).toBe(true);
	});
});
