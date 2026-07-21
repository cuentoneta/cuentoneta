import { compareViewports } from './screen.utils';
import type { Viewport } from './screen.utils';

describe('compareViewports', () => {
	it('should return a positive number when the current viewport is bigger', () => {
		expect(compareViewports('lg', 'md')).toBeGreaterThan(0);
		expect(compareViewports('xl', 'xs')).toBeGreaterThan(0);
	});

	it('should return a negative number when the current viewport is smaller', () => {
		expect(compareViewports('sm', 'md')).toBeLessThan(0);
		expect(compareViewports('xs', 'xl')).toBeLessThan(0);
	});

	it('should return zero for equivalent viewports', () => {
		expect(compareViewports('md', 'md')).toBe(0);
	});

	it('should throw when either viewport is outside the scale', () => {
		expect(() => compareViewports('lg', 'invalid' as Viewport)).toThrow();
		expect(() => compareViewports('invalid' as Viewport, 'lg')).toThrow();
	});
});
