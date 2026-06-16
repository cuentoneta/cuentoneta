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
		const filename = context.filename ?? context.getFilename();
		if (!filename.endsWith('.stories.ts')) return {};

		function findProperty(objectExpression, key) {
			if (!objectExpression || objectExpression.type !== 'ObjectExpression') return undefined;
			return objectExpression.properties.find(
				(prop) =>
					prop.type === 'Property' && !prop.computed && prop.key && (prop.key.name === key || prop.key.value === key),
			);
		}

		function resolveToObjectExpression(node, scope) {
			if (!node) return undefined;
			if (node.type === 'ObjectExpression') return node;
			if (node.type === 'Identifier' && scope) {
				// Cross-module imports (e.g. `import meta from './meta.config'; export default meta`) are
				// not resolved — the ImportBinding has no `init` value in the local file, so this returns
				// undefined and the rule silently skips. Skipping is safer than false-positives.
				const variable = scope.references.find((ref) => ref.identifier === node)?.resolved;
				const definition = variable?.defs?.[0];
				const init = definition?.node?.init;
				if (init && init.type === 'ObjectExpression') return init;
			}
			return undefined;
		}

		// Each nested value below is checked for `type === 'ObjectExpression'` before recursing.
		// A non-ObjectExpression value (e.g. a spread, a function call, a variable reference) is
		// skipped silently to avoid false-positives on dynamically-built parameters. The trade-off
		// is that those constructions also escape enforcement; see PLAN.md Risk #2.
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
				const scope = context.sourceCode?.getScope?.(node) ?? context.getScope?.();
				const meta = resolveToObjectExpression(node.declaration, scope);
				if (!meta) return;
				checkMeta(meta, node);
			},
		};
	},
};
