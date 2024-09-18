import nx from '@nx/eslint-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: ['!**/*'],
	},
	...compat.extends('plugin:storybook/recommended'),
	{
		plugins: {
			'@nx': nx,
		},
	},
	...compat
		.extends(
			'plugin:@nx/typescript',
			'plugin:@nx/angular',
			'plugin:@angular-eslint/template/process-inline-templates',
			'plugin:testing-library/angular',
			'plugin:jest-dom/recommended',
		)
		.map((config) => ({
			...config,
			files: ['**/*.ts'],
		})),
	{
		files: ['**/*.ts'],

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

			'@typescript-eslint/no-inferrable-types': 0,
			'@typescript-eslint/no-extra-semi': 'error',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'no-extra-semi': 'off',
		},
	},
	...compat.extends('plugin:@nx/angular-template').map((config) => ({
		...config,
		files: ['**/*.html'],
	})),
	{
		files: ['**/*.html'],
		rules: {},
	},
];
