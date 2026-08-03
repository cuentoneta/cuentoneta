import { describe, expect, it } from 'vitest';

import { requireEnv } from './env';

const VARIABLE = 'SANITY_STUDIO_PROJECT_ID';

describe('requireEnv', () => {
	it('returns the value when it is present', () => {
		expect(requireEnv(VARIABLE, 's4dbqkc5')).toBe('s4dbqkc5');
	});

	it('throws naming the variable when it is missing', () => {
		expect(() => requireEnv(VARIABLE, undefined)).toThrow(VARIABLE);
	});

	it('treats an empty value as missing', () => {
		// Es el estado que deja un .env con la clave declarada y sin valor, más común que la ausencia total.
		expect(() => requireEnv(VARIABLE, '')).toThrow(VARIABLE);
	});
});
