/**
 * Mantiene sincronizados el registro de tareas de `pnpm ops` y su catálogo: cada id de `OPS_TASKS`
 * necesita su fila en `.claude/references/ops.md`, y cada fila su tarea. La tabla se escribe a mano y
 * nada más la relee, así que las dos formas de la deriva envejecen en silencio.
 *
 * El catálogo se resuelve desde `context.cwd`: la comparación es contra la raíz del repo que ESLint
 * lintea, no contra la ruta absoluta del proceso.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** @typedef {import('@typescript-eslint/utils').TSESTree.Expression} Expression */
/** @typedef {import('@typescript-eslint/utils').TSESTree.ObjectExpression} ObjectExpression */
/** @typedef {import('@typescript-eslint/utils').TSESTree.Property} Property */
/** @typedef {import('@typescript-eslint/utils').TSESTree.VariableDeclarator} VariableDeclarator */

const REGISTRY_FILE = 'scripts/ops/registry.ts';
const CATALOG_PATH = '.claude/references/ops.md';
const TASKS_DECLARATION = 'OPS_TASKS';

// La primera celda de una fila del catálogo: el id va entre backticks, y una tarea con argumentos los
// escribe a continuación.
const CATALOG_ROW = /^\|\s*`([^`]+)`/;

/**
 * Saca los envoltorios de tipo (`as const satisfies …`) que quedan entre la declaración y el objeto.
 *
 * @param {Expression | null} expression
 * @returns {Expression | null}
 */
function unwrapTypes(expression) {
	let current = expression;
	while (
		current?.type === 'TSAsExpression' ||
		current?.type === 'TSSatisfiesExpression' ||
		current?.type === 'TSTypeAssertion'
	) {
		current = current.expression;
	}
	return current;
}

/**
 * @param {Expression | null | undefined} expression
 * @returns {expression is import('@typescript-eslint/utils').TSESTree.CallExpression}
 */
function isFreezeCall(expression) {
	return (
		expression?.type === 'CallExpression' &&
		expression.callee.type === 'MemberExpression' &&
		expression.callee.object.type === 'Identifier' &&
		expression.callee.object.name === 'Object' &&
		expression.callee.property.type === 'Identifier' &&
		expression.callee.property.name === 'freeze'
	);
}

/**
 * El objeto que declara `OPS_TASKS`, con o sin el `Object.freeze` que lo congela; `undefined` si la
 * forma no se puede leer estáticamente.
 *
 * @param {VariableDeclarator} declarator
 * @returns {ObjectExpression | undefined}
 */
function declaredObject(declarator) {
	const init = unwrapTypes(declarator.init);
	if (init?.type === 'ObjectExpression') return init;
	if (!isFreezeCall(init)) return undefined;
	const [argument] = init.arguments;
	const frozen = unwrapTypes(argument?.type === 'SpreadElement' ? null : argument);
	return frozen?.type === 'ObjectExpression' ? frozen : undefined;
}

/**
 * El id de una tarea declarado como clave, escrita como identificador o como string.
 *
 * @param {Property} property
 * @returns {string | undefined}
 */
function taskId(property) {
	if (property.key.type === 'Identifier') return property.key.name;
	return property.key.type === 'Literal' && typeof property.key.value === 'string' ? property.key.value : undefined;
}

/**
 * Los ids que documenta la tabla del catálogo, tomados de la primera celda de cada fila.
 *
 * @param {string} cwd
 * @returns {Set<string>}
 */
function catalogTaskIds(cwd) {
	const ids = new Set();
	for (const line of readFileSync(resolve(cwd, CATALOG_PATH), 'utf8').split('\n')) {
		const id = CATALOG_ROW.exec(line)?.[1].trim().split(/\s+/)[0];
		if (id) ids.add(id);
	}
	return ids;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Verifica que el catálogo de `pnpm ops` documente exactamente las tareas de `OPS_TASKS`.',
		},
		schema: [],
		messages: {
			undocumented:
				'La tarea `{{id}}` de `OPS_TASKS` no figura en `.claude/references/ops.md`: agregá su fila a la tabla.',
			stale:
				'`.claude/references/ops.md` documenta `{{id}}`, que ya no está en `OPS_TASKS`: quitá su fila del catálogo.',
			unreadable: 'No se pudo leer la lista de tareas de `OPS_TASKS`: la regla no puede compararla con el catálogo.',
		},
	},
	create(context) {
		const filename = context.filename.split('\\').join('/');
		if (!filename.endsWith(REGISTRY_FILE)) return {};

		/** @type {{ node: import('eslint').Rule.Node; id: string }[]} */
		const declarations = [];
		/** @type {import('eslint').Rule.Node | undefined} */
		let declarationNode;

		return {
			VariableDeclarator(node) {
				if (node.id.type !== 'Identifier' || node.id.name !== TASKS_DECLARATION) return;
				const object = declaredObject(/** @type {VariableDeclarator} */ (/** @type {unknown} */ (node)));
				if (!object) return;
				declarationNode = node;
				for (const property of object.properties) {
					if (property.type !== 'Property') continue;
					const id = taskId(property);
					if (id)
						declarations.push({
							node: /** @type {import('eslint').Rule.Node} */ (/** @type {unknown} */ (property.key)),
							id,
						});
				}
			},
			'Program:exit'(program) {
				if (!declarationNode) {
					context.report({ node: program, messageId: 'unreadable' });
					return;
				}
				const documented = catalogTaskIds(context.cwd);
				const declared = new Set(declarations.map((declaration) => declaration.id));
				for (const { node, id } of declarations) {
					if (!documented.has(id)) context.report({ node, messageId: 'undocumented', data: { id } });
				}
				for (const id of documented) {
					if (!declared.has(id)) context.report({ node: declarationNode, messageId: 'stale', data: { id } });
				}
			},
		};
	},
};
