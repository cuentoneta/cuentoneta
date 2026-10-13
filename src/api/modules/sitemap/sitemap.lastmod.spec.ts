import { PAGE_REVISED_ON, resolveLastmod } from './sitemap.lastmod';

describe('resolveLastmod', () => {
	const revisedOn = '2026-08-31';

	it('publishes the latest literary work date when it is after the page revision', () => {
		expect(resolveLastmod('2026-09-01', revisedOn)).toBe('2026-09-01');
	});

	it.each([
		['older than the revision', '2026-08-30'],
		['on the revision day', revisedOn],
		['absent', undefined],
	])('publishes the page revision when the latest literary work is %s', (_case, date) => {
		expect(resolveLastmod(date, revisedOn)).toBe(revisedOn);
	});
});

// La comparación es lexicográfica: una fecha con otra forma —sin ceros a la izquierda, con hora— no
// rompería el tipo y publicaría un `lastmod` equivocado sin que nada falle.
describe('PAGE_REVISED_ON', () => {
	it.each(Object.entries(PAGE_REVISED_ON))('declares the %s revision as YYYY-MM-DD', (_page, revisedOn) => {
		expect(revisedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
