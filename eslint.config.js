import playwright from 'eslint-plugin-playwright';
import nx from '@nx/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin';
import storybook from 'eslint-plugin-storybook';
import vitest from '@vitest/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';

// Reglas base de ES modules: prohíben CommonJS.
const commonRestrictedSyntax = [
	{
		selector: 'MemberExpression[object.name="module"][property.name="exports"]',
		message: 'Use ES modules (export) instead of CommonJS (module.exports)',
	},
	{
		selector: 'MemberExpression[object.name="exports"]',
		message: 'Use ES modules (export) instead of CommonJS (exports)',
	},
];

// Métodos de `vi.*` que tienen wrapper en `src/test-utils.ts` (@test-utils).
const viWrappedMethods = [
	'fn',
	'spyOn',
	'clearAllMocks',
	'resetAllMocks',
	'restoreAllMocks',
	'useFakeTimers',
	'useRealTimers',
	'advanceTimersByTime',
	'advanceTimersByTimeAsync',
	'runOnlyPendingTimers',
	'setSystemTime',
];

// Prohíbe el uso directo de `vi.*` en los specs y redirige a los wrappers de `@test-utils`.
// `src/test-utils.ts` es la única excepción (override más abajo).
const viRestrictedSyntax = [
	...viWrappedMethods.map((name) => ({
		selector: `CallExpression[callee.object.name="vi"][callee.property.name="${name}"]`,
		message: `vi.${name}() está prohibido. Usá ${name}() desde '@test-utils'.`,
	})),
	{
		selector: 'CallExpression[callee.object.name="vi"][callee.property.name="mock"]',
		message: 'vi.mock() está prohibido. Usá inyección de dependencias y dobles InMemory* en su lugar.',
	},
	{
		selector: 'CallExpression[callee.object.name="vi"][callee.property.name="mocked"]',
		message: "vi.mocked() está prohibido. Casteá la función auto-mockeada con el tipo Mock de '@test-utils'.",
	},
];

export default [
	{
		name: 'ignores',
		ignores: ['!**/*', '.nx', 'dist'],
	},
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	...storybook.configs['flat/recommended'],
	...nx.configs['flat/angular'],
	...nx.configs['flat/angular-template'],
	{
		name: 'testing',
		files: ['**/src/**/?(*.)+(spec|test).ts'],
		plugins: {
			vitest,
			'testing-library': testingLibrary,
		},
		rules: {
			...testingLibrary.configs['flat/angular'].rules,
			'vitest/no-focused-tests': 'error',
		},
	},
	{
		name: 'playwright',
		files: ['**/e2e/**/?(*.)+(spec|test).ts'],
		plugins: {
			playwright,
		},
		rules: {
			...playwright.configs['flat/recommended'],
		},
	},
	{
		name: 'nx',
		files: ['**/*.ts'],
		plugins: {
			'@stylistic/js': stylisticJs,
			'no-barrel-files': noBarrelFiles,
		},
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'cuentoneta',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'cuentoneta',
					style: 'kebab-case',
				},
			],
			'@angular-eslint/prefer-signals': 'error',
			'@typescript-eslint/no-inferrable-types': 0,
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-require-imports': 'error',
			'no-restricted-syntax': ['error', ...commonRestrictedSyntax, ...viRestrictedSyntax],
			'@stylistic/js/no-extra-semi': 'off',
			'no-barrel-files/no-barrel-files': 'error',
			'preserve-caught-error': 'error',
		},
	},
	{
		// `src/test-utils.ts` es el único punto donde se permite usar `vi.*` directamente:
		// es justamente el wrapper que el resto del repo debe consumir.
		name: 'test-utils-vi-exception',
		files: ['src/test-utils.ts'],
		rules: {
			'no-restricted-syntax': ['error', ...commonRestrictedSyntax],
		},
	},
	{
		name: 'html',
		files: ['**/*.html'],
		rules: {
			'@angular-eslint/template/prefer-control-flow': 'error',
			'@angular-eslint/template/prefer-self-closing-tags': 'error',
			'@angular-eslint/template/prefer-ngsrc': 'error',
		},
	},
	{
		files: ['**/*.ts', '**/*.js'],
		// Override or add rules here
		rules: {},
	},
];
