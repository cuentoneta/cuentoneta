/**
 * Las configs de base del lint: los recomendados de ESLint, typescript-eslint y angular-eslint, más
 * eslint-config-prettier. `eslint.config.mjs` las ubica en dos tramos (`languageConfigs` antes de los
 * de Storybook, `angularConfigs` después), porque el orden decide qué bloque gana cada regla.
 */
import { resolve } from 'node:path';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const TYPESCRIPT_FILES = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'];
const JAVASCRIPT_FILES = ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'];

/**
 * Aplica cada config a `files` reemplazando el suyo, no intersectándolo: así un config pensado para
 * TypeScript, como `typescript-eslint/eslint-recommended`, rige también sobre los .js del repo.
 *
 * @param {string[]} files
 * @param {import('eslint').Linter.Config[]} configs
 * @returns {import('eslint').Linter.Config[]}
 */
function withFiles(files, configs) {
	return configs.map((config) => ({ ...config, files }));
}

// Desvíos de `typescript-eslint/recommended` que conserva el lint del repo. Sobre los .ts, el bloque de
// convenciones de `eslint.config.mjs` vuelve a fijar varios; sobre los .js de `tools/` y `scripts/`
// rigen estos tal cual.
/** @type {import('eslint').Linter.RulesRecord} */
const typescriptOverrides = {
	'@typescript-eslint/explicit-member-accessibility': 'off',
	'@typescript-eslint/explicit-module-boundary-types': 'off',
	'@typescript-eslint/explicit-function-return-type': 'off',
	'@typescript-eslint/no-parameter-properties': 'off',
	'@typescript-eslint/no-non-null-assertion': 'warn',
	'@typescript-eslint/adjacent-overload-signatures': 'error',
	'@typescript-eslint/prefer-namespace-keyword': 'error',
	'no-empty-function': 'off',
	'@typescript-eslint/no-empty-function': 'error',
	'@typescript-eslint/no-inferrable-types': 'error',
	'@typescript-eslint/no-unused-vars': 'warn',
	'@typescript-eslint/no-empty-interface': 'error',
	'@typescript-eslint/no-explicit-any': 'warn',
	'@typescript-eslint/no-require-imports': 'off',
};

/** @type {import('eslint').Linter.Config[]} */
export const languageConfigs = [
	...withFiles(TYPESCRIPT_FILES, [js.configs.recommended, ...tseslint.configs.recommended]),
	{
		name: 'typescript',
		files: TYPESCRIPT_FILES,
		plugins: { '@typescript-eslint': tseslint.plugin },
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 2020,
			sourceType: 'module',
			parserOptions: { tsconfigRootDir: resolve(import.meta.dirname, '..', '..') },
		},
		rules: typescriptOverrides,
	},
	...withFiles(JAVASCRIPT_FILES, [js.configs.recommended, ...tseslint.configs.recommended]),
	{
		name: 'javascript',
		files: JAVASCRIPT_FILES,
		plugins: { '@typescript-eslint': tseslint.plugin },
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
		},
		rules: { ...typescriptOverrides, '@typescript-eslint/no-var-requires': 'off' },
	},
	eslintConfigPrettier,
];

/** @type {import('eslint').Linter.Config[]} */
export const angularConfigs = [
	...withFiles(['**/*.ts'], angular.configs.tsRecommended),
	{
		name: 'angular',
		files: ['**/*.ts'],
		languageOptions: { globals: { ...globals.browser, ...globals.es2015, ...globals.node } },
		processor: angular.processInlineTemplates,
		plugins: { '@angular-eslint': angular.tsPlugin },
	},
	...withFiles(['**/*.html'], [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility]),
];
