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
import componentConfigInClass from './tools/eslint/component-config-in-class.js';
import zIndexScale from './tools/eslint/z-index-scale.js';
import noFullZodInBrowser from './tools/eslint/no-full-zod-in-browser.js';

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

// Cubren el hueco que dejan las otras dos reglas de `readonly`: `@angular-eslint/prefer-signals` solo
// alcanza propiedades que **son** signals —por eso no ve `output()`, que devuelve un OutputEmitterRef—
// y `@typescript-eslint/prefer-readonly` solo alcanza las `private`.
const readonlyFactories = ['effect', 'inject', 'output'];

const readonlyFactoryMessage =
	'Las dependencias inyectadas, los effects y los outputs se declaran `readonly` (la referencia no se reasigna) — ver angular-components.md.';

// Vive suelto porque más de un bloque lo necesita: en flat config, un bloque posterior que redeclare
// `no-restricted-imports` reemplaza su array en vez de mergearlo, así que quien acote por scope tiene
// que volver a esparcirlo o perdería la restricción del corpus sin que nada avise.
const singleWorkCorpusImportPattern = {
	group: ['@mocks/onoff/**', '**/mocks/onoff/**'],
	message:
		'No importes una obra puntual del corpus: usá las colecciones de @mocks/onoff-literary-works.mock (onoffLiteraryWorksMock, onoffLiteraryWorkEpigraphsMock) o sus selectores por capacidad (onoffLiteraryWorksWithEpigraphs, onoffLiteraryWorksWithEditorialNote, …), que declaran el shape que el caso necesita y crecen con el canon.',
};

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
	{
		selector: `PropertyDefinition[readonly!=true][value.callee.name=/^(${readonlyFactories.join('|')})$/]`,
		message: readonlyFactoryMessage,
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
		message:
			'vi.mock() está prohibido. Usá inyección de dependencias y dobles de test (Stub*/Fake*/InMemory*/Spy*) en su lugar.',
	},
	{
		selector: 'CallExpression[callee.object.name="vi"][callee.property.name="mocked"]',
		message: "vi.mocked() está prohibido. Casteá la función auto-mockeada con el tipo Mock de '@test-utils'.",
	},
];

// Prohíbe rxResource/httpResource crudos en páginas: todo fetch de página debe decidir explícitamente
// su estrategia de SSR con ssrBlockingRxResource()/progressiveRxResource(), para no repetir la
// regresión de SEO por la que un fetch sin pendingUntilEvent sirve el skeleton al SSR sin bloquear.
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

// Reglas de lenguaje (no de framework): valen igual en la app Angular y en el Studio React, así que se
// declaran una vez y se esparcen en ambos bloques en vez de duplicarse.
const commonTypescriptRules = {
	'@typescript-eslint/explicit-member-accessibility': [
		'error',
		{ accessibility: 'explicit', overrides: { constructors: 'no-public' } },
	],
	'@typescript-eslint/no-inferrable-types': 0,
	'@typescript-eslint/no-unused-vars': 'error',
	'@typescript-eslint/no-non-null-assertion': 'error',
	'@typescript-eslint/no-explicit-any': 'error',
	'@typescript-eslint/no-require-imports': 'error',
	'no-barrel-files/no-barrel-files': 'error',
	'preserve-caught-error': 'error',
};

export default [
	{
		// Un bloque `ignores` global (sin `files`) REEMPLAZA los ignores implícitos de ESLint, incluido
		// `**/node_modules/**`. Sin nombrar el árbol de cms, ESLint intenta cargar los eslint.config.js
		// anidados de sus dependencias y aborta antes de lintear nada.
		name: 'ignores',
		ignores: ['!**/*', '.nx', 'dist', 'tools/**', 'cms/node_modules/**', 'cms/dist/**', 'cms/.sanity/**'],
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
			...commonTypescriptRules,
			'no-restricted-syntax': ['error', ...commonRestrictedSyntax, ...viRestrictedSyntax],
			'@stylistic/js/no-extra-semi': 'off',
		},
	},
	{
		// Las restricciones numéricas de CLAUDE.md, verificables por primera vez: hasta acá se sostenían
		// solo por lectura humana, en todo el repo. Van en un bloque propio y global porque miden tamaño
		// y forma, no framework: valen igual en la app Angular, en el Studio React, en los scripts, en
		// los e2e y en resources. Sumarlas al bloque `nx` no serviría — declara `**/*.ts`, que no
		// matchea el `.tsx` del Studio. Son reglas core, no `no-restricted-syntax`, así que no las
		// alcanza la trampa de que un bloque posterior reemplace el array en vez de mergearlo.
		name: 'size-and-complexity',
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs'],
		rules: {
			complexity: ['error', 10],
			'max-depth': ['error', 3],
		},
	},
	{
		// La exención de specs y stories es de **largo, no de forma**: el callback de un `describe` y el
		// `meta` de una story son funciones por sintaxis y no por lógica, así que medir su largo mide
		// el tamaño de la suite y del catálogo. `complexity` y `max-depth` siguen rigiendo ahí, porque
		// un test enrevesado es tan difícil de leer como cualquier otro código. `src/sanity/types.ts`
		// lo emite el typegen de Sanity: su largo no lo decide nadie. Nota de alcance: `tools/**` está
		// en el ignore global de más arriba, así que las reglas custom de ESLint y sus specs quedan
		// fuera de todo esto.
		name: 'size-limits',
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs'],
		ignores: ['**/*.spec.ts', '**/*.stories.ts', 'src/sanity/types.ts'],
		rules: {
			'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
			'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
		},
	},
	{
		// El Studio es React: las reglas de Angular buscan decoradores que no existen ahí. Se apagan de
		// forma explícita en vez de confiar en que nunca disparen. El bloque `nx` declara `**/*.ts`, que
		// no matchea `.tsx`, así que sin este bloque los componentes del Studio quedan sin ninguna regla.
		// Recompone commonRestrictedSyntax soltando viRestrictedSyntax: en cms/ no existe @test-utils al
		// que redirigir, y sus dobles se escriben a mano.
		name: 'cms',
		files: ['cms/**/*.ts', 'cms/**/*.tsx'],
		plugins: {
			'no-barrel-files': noBarrelFiles,
		},
		rules: {
			'@angular-eslint/directive-selector': 'off',
			'@angular-eslint/component-selector': 'off',
			'@angular-eslint/prefer-signals': 'off',
			'@angular-eslint/prefer-host-metadata-property': 'off',
			...commonTypescriptRules,
			'no-restricted-syntax': ['error', ...commonRestrictedSyntax],
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
		// La UI (components/pages) no debe importar el shape crudo de Sanity (`@sanity-types`): saltearía el
		// ACL. Al promover los tipos generados al kernel quedaron físicamente alcanzables desde
		// `src/app`; este guard preserva la frontera — el mapeo raw→dominio vive en el backend y la UI
		// consume el modelo de dominio (`@models`). Se usa la variante de typescript-eslint porque el shape
		// se importa como `import type`, que la regla base de ESLint no atrapa.
		name: 'no-sanity-types-in-ui',
		files: ['src/app/components/**/*.ts', 'src/app/pages/**/*.ts'],
		rules: {
			'no-restricted-imports': 'off',
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@sanity-types',
							message:
								'La UI no debe importar el shape crudo de Sanity (@sanity-types): saltea el ACL. Consumí el modelo de dominio (@models), mapeado por el backend.',
						},
					],
				},
			],
		},
	},
	{
		// Un spec o una story que importa una pieza puntual del corpus (`@mocks/onoff/<entidad>/<slug>.<entidad>.mock`) se ata a
		// esa obra: sus aserciones citan su prosa, y enriquecer el canon no las alcanza. Las colecciones y
		// los selectores por capacidad de `@mocks/onoff-*.mock` declaran el shape que el caso necesita y
		// crecen solos. `src/mocks/**` queda afuera: los agregadores son justamente quienes las importan.
		name: 'no-single-work-corpus-imports',
		files: ['src/**/*.ts'],
		ignores: ['src/mocks/**/*.ts'],
		rules: {
			'no-restricted-imports': 'off',
			'@typescript-eslint/no-restricted-imports': ['error', { patterns: [singleWorkCorpusImportPattern] }],
		},
	},
	{
		// El scope es todo lo que el navegador descarga, no los archivos que hoy importan zod: la regla
		// existe para el que todavía no se escribió. `src/api/**` queda afuera, donde zod clásico es lo
		// correcto. Va como regla propia y no como `no-restricted-imports`/`no-restricted-syntax` porque
		// este scope se solapa con varios bloques que ya declaran esas dos, y reemplazar sus arrays
		// desactivaría restricciones vigentes sin que nada avise.
		name: 'no-full-zod-in-browser',
		files: ['src/models/**/*.ts', 'src/app/**/*.ts'],
		plugins: {
			cuentoneta: { rules: { 'no-full-zod-in-browser': noFullZodInBrowser } },
		},
		rules: {
			'cuentoneta/no-full-zod-in-browser': 'error',
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
		name: 'component-config-in-class',
		files: ['src/**/*.ts'],
		// Los specs y las stories declaran componentes host de prueba, y sus fixtures de módulo
		// (`const collectionMock: Storylist = {...}`) son datos del test, no configuración de una clase.
		ignores: ['src/**/*.spec.ts', 'src/**/*.stories.ts'],
		plugins: {
			'custom-component-config': { rules: { 'component-config-in-class': componentConfigInClass } },
		},
		rules: {
			'custom-component-config/component-config-in-class': 'error',
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
		name: 'z-index-scale',
		// Las dos extensiones en un solo bloque: la regla elige su rama por el archivo, y el procesador de
		// plantillas inline del preset de Angular hace que `**/*.html` alcance también las plantillas de un
		// `.ts`. Los `.css` los cubre la regla homónima de Stylelint, que ESLint no lintea.
		files: ['src/**/*.ts', 'src/**/*.html'],
		plugins: {
			'custom-z-index': { rules: { 'z-index-scale': zIndexScale } },
		},
		rules: {
			'custom-z-index/z-index-scale': [
				'error',
				{
					// La franja alta queda reservada a los archivos que declaran una capa global de la
					// aplicación. Cualquier otro tiene que elevar con una capa interna y confinar su
					// apilamiento, que es lo que evita volver a competir con la barra.
					allowGlobalLayersIn: ['src/app/components/header/header.component.ts'],
				},
			],
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
