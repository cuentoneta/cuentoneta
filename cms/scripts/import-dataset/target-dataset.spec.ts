import { describe, expect, it } from 'vitest';

import { assertTargetDataset } from './target-dataset';

describe('assertTargetDataset', () => {
	it('accepts a target dataset', () => {
		expect(assertTargetDataset('staging')).toBe('staging');
	});

	it('refuses production, which is only ever read', () => {
		expect(() => assertTargetDataset('production')).toThrow('production');
	});

	it('refuses a missing dataset', () => {
		expect(() => assertTargetDataset(undefined)).toThrow();
		expect(() => assertTargetDataset('')).toThrow();
	});
});
