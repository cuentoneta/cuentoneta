/**
 * ¿La expresión llega a `makeEnvironmentProviders(...)`? Desciende por el cuerpo de la función y por
 * sus `return`, que es donde el envoltorio puede aparecer.
 *
 * @param {import('estree').Node | null | undefined} node
 * @returns {boolean}
 */
function containsMakeEnvironmentProviders(node) {
	if (!node) return false;
	if (node.type === 'CallExpression') {
		const callee = node.callee;
		if (callee.type === 'Identifier' && callee.name === 'makeEnvironmentProviders') {
			return true;
		}
	}
	if (node.type === 'BlockStatement') {
		return node.body.some((stmt) => containsMakeEnvironmentProviders(stmt));
	}
	if (node.type === 'ReturnStatement') {
		return containsMakeEnvironmentProviders(node.argument);
	}
	return false;
}

/** @param {string} name */
function isProviderFunction(name) {
	return name.startsWith('provide');
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').Function} node
 * @param {string} name
 */
function checkFunction(context, node, name) {
	if (!isProviderFunction(name)) return;
	const body = node.body;
	if (!body) return;
	if (!containsMakeEnvironmentProviders(body)) {
		context.report({
			node,
			messageId: 'missingMakeEnvironmentProviders',
			data: { name },
		});
	}
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require exported provider functions in *.provider.ts and *.mock.ts files to use makeEnvironmentProviders',
		},
		schema: [],
		messages: {
			missingMakeEnvironmentProviders:
				'Exported provider function "{{ name }}" must return EnvironmentProviders via makeEnvironmentProviders(). Do not return Provider[] directly.',
		},
	},
	create(context) {
		const filename = context.filename;
		const isProviderFile = filename.endsWith('.provider.ts');
		const isMockFile = filename.endsWith('.mock.ts');

		if (!isProviderFile && !isMockFile) {
			return {};
		}

		return {
			// export function provideX() { ... }
			/** @param {import('estree').FunctionDeclaration} node */
			'ExportNamedDeclaration > FunctionDeclaration'(node) {
				if (node.id) {
					checkFunction(context, node, node.id.name);
				}
			},
			// export const provideX = () => ...
			/** @param {import('estree').VariableDeclarator} node */
			'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
				if (
					node.id.type === 'Identifier' &&
					(node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression')
				) {
					checkFunction(context, node.init, node.id.name);
				}
			},
		};
	},
};
