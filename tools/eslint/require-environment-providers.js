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
		const filename = context.filename ?? context.getFilename();
		const isProviderFile = filename.endsWith('.provider.ts');
		const isMockFile = filename.endsWith('.mock.ts');

		if (!isProviderFile && !isMockFile) {
			return {};
		}

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

		function isProviderFunction(name) {
			return name.startsWith('provide');
		}

		function checkFunction(node, name) {
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

		return {
			// export function provideX() { ... }
			'ExportNamedDeclaration > FunctionDeclaration'(node) {
				if (node.id) {
					checkFunction(node, node.id.name);
				}
			},
			// export const provideX = () => ...
			'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
				if (
					node.id.type === 'Identifier' &&
					(node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression')
				) {
					checkFunction(node.init, node.id.name);
				}
			},
		};
	},
};
