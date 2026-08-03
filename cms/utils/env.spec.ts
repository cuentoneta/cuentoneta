import { afterEach, describe, expect, it } from 'vitest';

import { requireEnv } from './env';

const VARIABLE = 'SANITY_STUDIO_TEST_VARIABLE';

describe('requireEnv', () => {
	afterEach(() => {
		delete process.env[VARIABLE];
	});

	it('returns the value when the variable is set', () => {
		process.env[VARIABLE] = 's4dbqkc5';

		expect(requireEnv(VARIABLE)).toBe('s4dbqkc5');
	});

	it('throws naming the variable when it is missing', () => {
		expect(() => requireEnv(VARIABLE)).toThrow(VARIABLE);
	});

	it('treats an empty value as missing', () => {
		// Es el estado que deja un .env con la clave declarada y sin valor, más común que la ausencia total.
		process.env[VARIABLE] = '';

		expect(() => requireEnv(VARIABLE)).toThrow(VARIABLE);
	});
});
