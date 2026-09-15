import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

// REASON: la regla es un `.js` sin tipos propios; el RuleTester solo necesita el módulo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rule from './require-environment-providers.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const wrapped = (body: string) => `function makeEnvironmentProviders(p: unknown[]) { return p; }\n${body}`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('require-environment-providers', rule, {
	valid: [
		{ code: wrapped(`export function provideX() { return makeEnvironmentProviders([]); }`), filename: 'a.provider.ts' },
		{ code: wrapped(`export const provideX = () => makeEnvironmentProviders([]);`), filename: 'a.provider.ts' },
		// El prefijo `provide` es lo que marca a la función como candidata.
		{ code: `export function buildX() { return []; }`, filename: 'a.provider.ts' },
		// La regla se aplica por nombre de archivo: fuera de los dos sufijos no opina.
		{ code: `export function provideX() { return []; }`, filename: 'a.ts' },
		{ code: `export function provideX() { return []; }`, filename: 'a.service.ts' },
	],
	invalid: [
		{
			code: `export function provideX() { return []; }`,
			filename: 'a.provider.ts',
			errors: [{ messageId: 'missingMakeEnvironmentProviders' }],
		},
		{
			code: `export const provideX = () => [];`,
			filename: 'a.provider.ts',
			errors: [{ messageId: 'missingMakeEnvironmentProviders' }],
		},
		// El segundo sufijo que la regla reconoce; sin este caso, perderlo pasaría inadvertido.
		{
			code: `export function provideXMock() { return []; }`,
			filename: 'a.mock.ts',
			errors: [{ messageId: 'missingMakeEnvironmentProviders' }],
		},
	],
});
