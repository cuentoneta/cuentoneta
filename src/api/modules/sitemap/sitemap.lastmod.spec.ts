import { shiftDays } from '@testing/date-shift';
import { PAGE_REVISED_ON, resolveLastmod } from './sitemap.lastmod';

describe('resolveLastmod', () => {
	const revisedOn = PAGE_REVISED_ON.author;

	it('publishes the latest literary work date when it is after the page revision', () => {
		const later = shiftDays(revisedOn, 1);

		expect(resolveLastmod(later, revisedOn)).toBe(later);
	});

	it('publishes the page revision when the latest literary work is older', () => {
		expect(resolveLastmod(shiftDays(revisedOn, -1), revisedOn)).toBe(revisedOn);
	});

	it('publishes the page revision when both fall on the same day', () => {
		expect(resolveLastmod(revisedOn, revisedOn)).toBe(revisedOn);
	});

	it('publishes the page revision for a page that lists no literary work', () => {
		expect(resolveLastmod(undefined, revisedOn)).toBe(revisedOn);
	});
});

// La comparación es lexicográfica: una fecha con otra forma —sin ceros a la izquierda, con hora— no
// rompería el tipo y publicaría un `lastmod` equivocado sin que nada falle.
describe('PAGE_REVISED_ON', () => {
	it.each(Object.entries(PAGE_REVISED_ON))('declares the %s revision as YYYY-MM-DD', (_page, revisedOn) => {
		expect(revisedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
