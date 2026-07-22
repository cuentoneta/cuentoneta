import { compareViewports } from './screen.utils';
import type { Viewport } from './screen.utils';

describe('compareViewports', () => {
	it('returns a negative number when current is narrower than test', () => {
		expect(compareViewports('sm', 'lg')).toBeLessThan(0);
	});

	it('returns a positive number when current is wider than test', () => {
		expect(compareViewports('lg', 'sm')).toBeGreaterThan(0);
	});

	it('returns 0 when both viewports are equal', () => {
		expect(compareViewports('md', 'md')).toBe(0);
	});

	it('throws on an invalid viewport', () => {
		expect(() => compareViewports('lg', 'invalid' as Viewport)).toThrow('Viewport inválido: invalid');
	});
});
