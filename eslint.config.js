const nx = require('@nx/eslint-plugin');
const stylisticJs = require('@stylistic/eslint-plugin-js');
const storybook = require('eslint-plugin-storybook');
const jestDom = require('eslint-plugin-jest-dom');
const testingLibrary = require('eslint-plugin-testing-library');

module.exports = [
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
		files: ['**/?(*.)+(spec|test).ts'],
		plugins: {
			'jest-dom': jestDom,
			'testing-library': testingLibrary,
		},
		rules: {
			...testingLibrary.configs['flat/angular'].rules,
			...jestDom.configs['flat/recommended'].rules,
		},
	},
	{
		name: 'nx',
		files: ['**/*.ts'],
		plugins: {
			'@stylistic/js': stylisticJs,
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
			'@typescript-eslint/no-inferrable-types': 0,
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'@stylistic/js/no-extra-semi': 'off',
		},
	},
	{
		name: 'html',
		files: ['**/*.html'],
		rules: {
			'@angular-eslint/template/prefer-control-flow': 'error',
		},
	},
];
