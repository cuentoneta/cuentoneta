/**
 * Require every Storybook `*.stories.ts` default-export meta to set
 * parameters.docs.canvas.sourceState = 'shown'.
 *
 * Showing source by default keeps the docs canvas useful for consumers
 * who want a runnable snippet alongside the rendered story.
 */
/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: "Require parameters.docs.canvas.sourceState: 'shown' in every Storybook meta",
		},
		schema: [],
		messages: {
			missingParameters:
				"Storybook meta is missing `parameters`. Add `parameters: { docs: { canvas: { sourceState: 'shown' } } }`.",
			missingDocs: "Storybook meta is missing `parameters.docs`. Add `docs: { canvas: { sourceState: 'shown' } }`.",
			missingCanvas: "Storybook meta is missing `parameters.docs.canvas`. Add `canvas: { sourceState: 'shown' }`.",
			missingSourceState: "Storybook meta is missing `parameters.docs.canvas.sourceState: 'shown'`.",
			wrongSourceState: "Storybook meta sets `parameters.docs.canvas.sourceState` to {{ value }} — must be 'shown'.",
		},
	},
	create(context) {
		const filename = context.filename;
		if (!filename.endsWith('.stories.ts')) return {};

		/**
		 * @param {import('estree').Node | undefined} objectExpression
		 * @param {string} key
		 * @returns {import('estree').Property | undefined}
		 */
		function findProperty(objectExpression, key) {
			if (!objectExpression || objectExpression.type !== 'ObjectExpression') return undefined;
			const found = objectExpression.properties.find(
				(prop) =>
					prop.type === 'Property' &&
					!prop.computed &&
					((prop.key.type === 'Identifier' && prop.key.name === key) ||
						(prop.key.type === 'Literal' && prop.key.value === key)),
			);
			return found?.type === 'Property' ? found : undefined;
		}

		/**
		 * @param {import('estree').ExportDefaultDeclaration['declaration'] | null | undefined} node
		 * @param {import('eslint').Scope.Scope | undefined} scope
		 * @returns {import('estree').ObjectExpression | undefined}
		 */
		function resolveToObjectExpression(node, scope) {
			if (!node) return undefined;
			if (node.type === 'ObjectExpression') return node;
			if (node.type === 'Identifier' && scope) {
				// Un import de otro módulo (`import meta from './meta.config'; export default meta`) no se
				// resuelve: en el archivo local su binding no tiene declarador con inicializador, así que
				// el meta queda sin resolver y la regla se saltea. Saltear es más seguro que marcar de más.
				const variable = scope.references.find((ref) => ref.identifier === node)?.resolved;
				const definition = variable?.defs?.[0];
				const declarator = definition?.node;
				if (declarator?.type !== 'VariableDeclarator') return undefined;
				const init = declarator.init;
				if (init && init.type === 'ObjectExpression') return init;
			}
			return undefined;
		}

		// Cada valor anidado se verifica como ObjectExpression antes de descender. Un valor que no lo
		// es —un spread, una llamada, una referencia a variable— se saltea en silencio para no marcar
		// de más sobre parámetros construidos dinámicamente; el costo aceptado es que esas mismas
		// construcciones quedan fuera del enforcement.
		/**
		 * @param {import('estree').ObjectExpression} meta
		 * @param {import('estree').Node} reportNode
		 */
		function checkMeta(meta, reportNode) {
			const parameters = findProperty(meta, 'parameters');
			if (!parameters) {
				context.report({ node: reportNode, messageId: 'missingParameters' });
				return;
			}
			const parametersValue = parameters.value;
			if (parametersValue.type !== 'ObjectExpression') return;

			const docs = findProperty(parametersValue, 'docs');
			if (!docs) {
				context.report({ node: parameters, messageId: 'missingDocs' });
				return;
			}
			const docsValue = docs.value;
			if (docsValue.type !== 'ObjectExpression') return;

			const canvas = findProperty(docsValue, 'canvas');
			if (!canvas) {
				context.report({ node: docs, messageId: 'missingCanvas' });
				return;
			}
			const canvasValue = canvas.value;
			if (canvasValue.type !== 'ObjectExpression') return;

			const sourceState = findProperty(canvasValue, 'sourceState');
			if (!sourceState) {
				context.report({ node: canvas, messageId: 'missingSourceState' });
				return;
			}
			const valueNode = sourceState.value;
			if (valueNode.type === 'Literal' && valueNode.value !== 'shown') {
				context.report({
					node: sourceState,
					messageId: 'wrongSourceState',
					data: { value: JSON.stringify(valueNode.value) },
				});
			}
		}

		return {
			ExportDefaultDeclaration(node) {
				const scope = context.sourceCode.getScope(node);
				const meta = resolveToObjectExpression(node.declaration, scope);
				if (!meta) return;
				checkMeta(meta, node);
			},
		};
	},
};
