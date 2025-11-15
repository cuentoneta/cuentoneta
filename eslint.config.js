import playwright from 'eslint-plugin-playwright';
import nx from '@nx/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin';
import storybook from 'eslint-plugin-storybook';
import jest from 'eslint-plugin-jest';
import jestDom from 'eslint-plugin-jest-dom';
import testingLibrary from 'eslint-plugin-testing-library';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';

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
			'jest-dom': jestDom,
			'testing-library': testingLibrary,
		},
		rules: {
			...testingLibrary.configs['flat/angular'].rules,
			...jestDom.configs['flat/recommended'].rules,
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
			jest: jest,
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
			'no-restricted-syntax': [
				'error',
				{
					selector: 'MemberExpression[object.name="module"][property.name="exports"]',
					message: 'Use ES modules (export) instead of CommonJS (module.exports)',
				},
				{
					selector: 'MemberExpression[object.name="exports"]',
					message: 'Use ES modules (export) instead of CommonJS (exports)',
				},
			],
			'@stylistic/js/no-extra-semi': 'off',
			'jest/no-focused-tests': 'error',
			'no-barrel-files/no-barrel-files': 'error',
			'preserve-caught-error': 'error',
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
