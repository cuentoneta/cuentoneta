import playwright from 'eslint-plugin-playwright';
import nx from '@nx/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin';
import storybook from 'eslint-plugin-storybook';
import vitest from '@vitest/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';
import requireEnvironmentProviders from './tools/eslint/require-environment-providers.js';
import storybookSourceState from './tools/eslint/storybook-source-state.js';
import noApplyInHostStyles from './tools/eslint/no-apply-in-host-styles.js';

// Restricciones de sintaxis comunes: CommonJS, enums, lifecycle hooks y propiedades estáticas.
const lifecycleHooks = [
	['OnInit', 'Usá inicialización en el constructor y signals en lugar de OnInit.'],
	['OnChanges', 'Reaccioná a cambios de input con computed() o effect() en lugar de OnChanges.'],
	['DoCheck', 'Usá computed() o effect() en lugar de DoCheck.'],
	['AfterContentInit', 'Usá contentChild() y effect() en lugar de AfterContentInit.'],
	['AfterContentChecked', 'Usá computed() o effect() en lugar de AfterContentChecked.'],
	['AfterViewInit', 'Usá viewChild() y effect() en lugar de AfterViewInit.'],
	['AfterViewChecked', 'Usá computed() o effect() en lugar de AfterViewChecked.'],
];

const commonRestrictedSyntax = [
	{
		selector: 'MemberExpression[object.name="module"][property.name="exports"]',
		message: 'Use ES modules (export) instead of CommonJS (module.exports)',
	},
	{
		selector: 'MemberExpression[object.name="exports"]',
		message: 'Use ES modules (export) instead of CommonJS (exports)',
	},
	{
		selector: 'TSEnumDeclaration',
		message: 'Los enum están prohibidos. Usá Object.freeze({...} as const) — ver typescript.md.',
	},
	...lifecycleHooks.map(([hook, message]) => ({
		selector: `TSClassImplements > Identifier[name="${hook}"]`,
		message: `${hook} está prohibido. ${message}`,
	})),
	{
		selector: 'PropertyDefinition[static=true]',
		message: 'Las propiedades estáticas están prohibidas. Usá un servicio singleton (providedIn: root).',
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

// Prohíbe rxResource/httpResource crudos en páginas: todo fetch de página debe decidir explícitamente
// su estrategia de SSR con ssrBlockingRxResource()/progressiveRxResource(), para no repetir la
// regresión de SEO de #1697 (un fetch sin pendingUntilEvent sirve el skeleton al SSR sin bloquear).
const pageFetchRestrictedSyntax = [
	{
		selector: "CallExpression[callee.name='rxResource']",
		message:
			'En páginas usá ssrBlockingRxResource() o progressiveRxResource() de @utils/ssr-resource en vez de rxResource crudo — rxResource omite pendingUntilEvent y puede reproducir la regresión de SEO de #1697.',
	},
	{
		selector: "CallExpression[callee.name='httpResource']",
		message:
			'En páginas usá ssrBlockingRxResource() o progressiveRxResource() de @utils/ssr-resource en vez de httpResource crudo — httpResource omite el bloqueo explícito del SSR y puede reproducir la regresión de SEO de #1697.',
	},
];

export default [
	{
		name: 'ignores',
		ignores: ['!**/*', '.nx', 'dist', 'tools/**'],
	},
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	...storybook.configs['flat/recommended'],
	...nx.configs['flat/angular'],
	...nx.configs['flat/angular-template'],
	{
		name: 'testing',
		files: ['**/src/**/?(*.)+(spec|test).ts', '**/e2e/_utils/**/?(*.)+(spec|test).ts'],
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
		// Los specs de Vitest bajo e2e/_utils no corren con Playwright; se rigen por el bloque 'testing'.
		ignores: ['**/e2e/_utils/**'],
		plugins: {
			playwright,
		},
		languageOptions: {
			...playwright.configs['flat/recommended'].languageOptions,
		},
		rules: {
			...playwright.configs['flat/recommended'].rules,
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
			'@angular-eslint/prefer-host-metadata-property': 'error',
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{ accessibility: 'explicit', overrides: { constructors: 'no-public' } },
			],
			'@typescript-eslint/no-inferrable-types': 0,
			'@typescript-eslint/no-unused-vars': 'error',
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
		// Compone commonRestrictedSyntax con las restricciones de fetch de página: en flat config, un
		// bloque posterior que setea la misma regla REEMPLAZA el array del bloque `nx`, no lo mergea —
		// recomponer commonRestrictedSyntax evita perder su cobertura (enum/lifecycle/estáticas) en páginas.
		name: 'ssr-fetch-must-decide-blocking',
		files: ['src/app/pages/**/*.ts'],
		ignores: ['**/*.spec.ts'],
		rules: {
			'no-restricted-syntax': ['error', ...commonRestrictedSyntax, ...pageFetchRestrictedSyntax],
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
		name: 'require-environment-providers',
		files: ['src/app/providers/**/*.provider.ts', 'src/app/providers/**/*.mock.ts'],
		plugins: {
			'custom-providers': { rules: { 'require-environment-providers': requireEnvironmentProviders } },
		},
		rules: {
			'custom-providers/require-environment-providers': 'error',
		},
	},
	{
		name: 'storybook-source-state',
		files: ['**/*.stories.ts'],
		plugins: {
			'custom-storybook': { rules: { 'storybook-source-state': storybookSourceState } },
		},
		rules: {
			'custom-storybook/storybook-source-state': 'error',
		},
	},
	{
		name: 'no-apply-in-host-styles',
		files: ['src/**/*.ts'],
		plugins: {
			'custom-host': { rules: { 'no-apply-in-host-styles': noApplyInHostStyles } },
		},
		rules: {
			'custom-host/no-apply-in-host-styles': 'error',
		},
	},
	{
		// projectService auto-detecta el tsconfig de cada archivo; el parser ya lo fija el preset de nx.
		name: 'typed-linting',
		files: ['src/**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			'@angular-eslint/no-uncalled-signals': 'error',
			// Solo alcanza miembros `private`; los `protected` quedan a cargo de la review (#1877).
			'@typescript-eslint/prefer-readonly': 'error',
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
