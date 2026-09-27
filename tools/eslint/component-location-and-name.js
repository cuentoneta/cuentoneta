/**
 * Verifica dónde vive una clase `@Component` y cómo se llama: sin el sufijo `Component`, bajo
 * `src/app/components/` o `src/app/pages/`, con el nombre de la clase derivado del de su archivo, y con
 * la plantilla y los estilos externos como hermanos del mismo nombre. La convención y su porqué:
 * `angular-components.md#ubicación-y-nombre-de-componentes`.
 *
 * Las excepciones van por ruta dentro de la regla, igual que las de `no-ts-extension-imports`: sumar una
 * tiene que verse en el diff. Los specs y las stories quedan afuera enteros: sus hosts son andamiaje de
 * un solo archivo, no componentes de la aplicación.
 *
 * Que una página ruteada viva en un `.page.ts` no lo decide esta regla sino `page-sources.util.ts`, que
 * resuelve el fuente de cada ruta y hace fallar al gate `test` si no lo encuentra.
 */

import { basename, relative } from 'node:path';

const COMPONENT_DIRS = Object.freeze({ components: 'src/app/components/', pages: 'src/app/pages/' });
const PAGES_DIR = COMPONENT_DIRS.pages;

/** El componente raíz: no es reutilizable ni una página, así que no cabe en ninguna de las dos carpetas. */
const ROOT_COMPONENT = 'src/app/app.ts';

/** Soporte de tests y del catálogo: no es código de la aplicación, así que su ubicación es libre. */
const LOCATION_EXEMPT_DIR = 'src/testing/';

const TEST_FILE = /\.(spec|stories)\.ts$/;
const PAGE_EXTENSION = '.page';
const COMPONENT_SUFFIX = 'Component';
const PAGE_SUFFIX = 'Page';

/** @typedef {import('@typescript-eslint/utils').TSESTree.ClassDeclaration} ClassDeclaration */
/** @typedef {import('@typescript-eslint/utils').TSESTree.CallExpression} CallExpression */
/** @typedef {import('@typescript-eslint/utils').TSESTree.ObjectExpression} ObjectExpression */
/** @typedef {import('@typescript-eslint/utils').TSESTree.Node} TsNode */
/** @typedef {import('eslint').Rule.RuleContext} RuleContext */

/** @param {string} kebab */
const toPascal = (kebab) =>
	kebab
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');

/** @param {string} pascal */
const toKebab = (pascal) => pascal.replace(/(?<=[a-z0-9])(?=[A-Z])/g, '-').toLowerCase();

/** @param {RuleContext} context */
const repoPath = (context) => relative(context.cwd, context.filename).replaceAll('\\', '/');

/**
 * La llamada `@Component(...)` que decora la clase, o `undefined` si no la decora.
 *
 * @param {ClassDeclaration} node
 * @returns {CallExpression | undefined}
 */
function componentDecorator(node) {
	for (const { expression } of node.decorators ?? []) {
		if (
			expression.type === 'CallExpression' &&
			expression.callee.type === 'Identifier' &&
			expression.callee.name === 'Component'
		) {
			return expression;
		}
	}
	return undefined;
}

/**
 * El objeto literal que recibe `@Component`, o `null` si recibe otra cosa (una variable, una llamada): en
 * ese caso la metadata no se puede leer estáticamente y los hermanos quedan sin verificar.
 *
 * @param {CallExpression} decorator
 * @returns {ObjectExpression | null}
 */
function literalMetadata(decorator) {
	const [argument] = decorator.arguments;
	return argument?.type === 'ObjectExpression' ? argument : null;
}

/**
 * El nombre de una clave de objeto, escrita como identificador o entre comillas.
 *
 * @param {TsNode} key
 */
function keyName(key) {
	if (key.type === 'Identifier') {
		return key.name;
	}
	return key.type === 'Literal' && typeof key.value === 'string' ? key.value : undefined;
}

/**
 * El archivo que le corresponde a una clase, para sugerirlo en el reporte.
 *
 * @param {string} className
 * @param {boolean} inPages
 */
function expectedFileFor(className, inPages) {
	const base = className.endsWith(COMPONENT_SUFFIX) ? className.slice(0, -COMPONENT_SUFFIX.length) : className;
	if (inPages && base.endsWith(PAGE_SUFFIX)) {
		return `${toKebab(base.slice(0, -PAGE_SUFFIX.length))}${PAGE_EXTENSION}.ts`;
	}
	return `${toKebab(base)}.ts`;
}

/**
 * El primer problema del nombre de la clase respecto de su archivo, o `null` si coincide.
 *
 * @param {string} className
 * @param {string} stem el nombre del archivo sin `.ts`
 * @param {boolean} inPages
 */
function nameProblem(className, stem, inPages) {
	const isPageFile = stem.endsWith(PAGE_EXTENSION);
	if (isPageFile && !inPages) {
		return 'pageOutsidePages';
	}
	if (!isPageFile && className.endsWith(PAGE_SUFFIX)) {
		return 'pageSuffixReserved';
	}
	const expected = isPageFile ? toPascal(stem.slice(0, -PAGE_EXTENSION.length)) + PAGE_SUFFIX : toPascal(stem);
	return className === expected ? null : 'nameMismatch';
}

/**
 * El nombre de la clase por sí mismo, sin mirar el archivo: que exista y que no lleve el sufijo `Component`.
 *
 * @param {RuleContext} context
 * @param {import('eslint').Rule.Node | import('estree').Identifier} target
 * @param {string | undefined} name
 */
function checkClassName(context, target, name) {
	if (!name) {
		context.report({ node: target, messageId: 'anonymousComponent' });
	} else if (name.endsWith(COMPONENT_SUFFIX)) {
		const expected = name.slice(0, -COMPONENT_SUFFIX.length);
		context.report({ node: target, messageId: 'componentSuffix', data: { name, expected } });
	}
}

/**
 * @param {RuleContext} context
 * @param {import('eslint').Rule.Node | import('estree').Identifier} target
 * @param {string} name
 * @param {string} path
 * @param {string} stem
 */
function checkName(context, target, name, path, stem) {
	const inPages = path.startsWith(PAGES_DIR);
	const problem = nameProblem(name, stem, inPages);
	if (problem) {
		const expectedFile = expectedFileFor(name, inPages);
		context.report({ node: target, messageId: problem, data: { name, expectedFile } });
	}
}

/**
 * Los literales de `templateUrl`, `styleUrl` y `styleUrls`, cada uno con la extensión que le corresponde.
 *
 * @param {ObjectExpression} metadata
 * @returns {{ node: TsNode, value: string, extension: string }[]}
 */
function siblingReferences(metadata) {
	/** @type {Record<string, string>} */
	const extensions = { templateUrl: 'html', styleUrl: 'css', styleUrls: 'css' };
	return metadata.properties.flatMap((property) => {
		if (property.type !== 'Property') {
			return [];
		}
		const extension = extensions[keyName(property.key) ?? ''];
		if (!extension) {
			return [];
		}
		const values = property.value.type === 'ArrayExpression' ? property.value.elements : [property.value];
		return values.flatMap((value) =>
			value?.type === 'Literal' && typeof value.value === 'string'
				? [{ node: value, value: value.value, extension }]
				: [],
		);
	});
}

/**
 * @param {RuleContext} context
 * @param {ObjectExpression} metadata
 * @param {string} stem
 */
function checkSiblings(context, metadata, stem) {
	for (const reference of siblingReferences(metadata)) {
		const expected = `./${stem}.${reference.extension}`;
		if (reference.value !== expected) {
			context.report({
				loc: reference.node.loc,
				messageId: 'siblingMismatch',
				data: { actual: reference.value, expected },
			});
		}
	}
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Verifica la ubicación y el nombre de las clases @Component.',
		},
		schema: [],
		messages: {
			anonymousComponent:
				'Una clase `@Component` lleva nombre, derivado del de su archivo — ver angular-components.md#ubicación-y-nombre-de-componentes.',
			componentSuffix:
				'`{{name}}` lleva el sufijo `Component`: la clase se nombra sin él (`{{expected}}`) — ver angular-components.md#ubicación-y-nombre-de-componentes.',
			misplaced:
				'Un `@Component` vive en `src/app/components/` o en `src/app/pages/`; `{{path}}` no está en ninguna de las dos — ver angular-components.md#ubicación-y-nombre-de-componentes.',
			nameMismatch:
				'`{{name}}` no coincide con el nombre de su archivo: se espera `{{expectedFile}}` — ver angular-components.md#ubicación-y-nombre-de-componentes.',
			pageOutsidePages:
				'Un `.page.ts` es una página ruteada y vive en `src/app/pages/` — ver angular-components.md#ubicación-y-nombre-de-componentes.',
			pageSuffixReserved:
				'El sufijo `Page` queda reservado a las páginas ruteadas, que viven en un `.page.ts`; `{{name}}` no está en uno — ver angular-components.md#ubicación-y-nombre-de-componentes.',
			siblingMismatch:
				'`{{actual}}` no comparte el nombre del componente: se espera `{{expected}}` — ver angular-components.md#ubicación-y-nombre-de-componentes.',
		},
	},
	create(context) {
		const path = repoPath(context);
		if (TEST_FILE.test(path)) {
			return {};
		}
		const inComponentDirs = Object.values(COMPONENT_DIRS).some((dir) => path.startsWith(dir));
		const locationExempt = path.startsWith(LOCATION_EXEMPT_DIR);
		const stem = basename(path, '.ts');

		return {
			ClassDeclaration(node) {
				// Los tipos de `eslint` describen ESTree, que no conoce los decoradores: se lee el AST que el
				// parser de TypeScript realmente entrega.
				const decorator = componentDecorator(/** @type {ClassDeclaration} */ (/** @type {unknown} */ (node)));
				if (!decorator) {
					return;
				}
				const name = node.id?.name;
				const target = node.id ?? node;

				checkClassName(context, target, name);
				if (locationExempt) {
					return;
				}
				if (!inComponentDirs && path !== ROOT_COMPONENT) {
					context.report({ node: target, messageId: 'misplaced', data: { path } });
					return;
				}

				if (name) {
					checkName(context, target, name, path, stem);
				}
				const metadata = literalMetadata(decorator);
				if (metadata) {
					checkSiblings(context, metadata, stem);
				}
			},
		};
	},
};
