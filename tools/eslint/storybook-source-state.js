/**
 * Exige que el meta exportado por defecto de toda `*.stories.ts` declare
 * `parameters.docs.canvas.sourceState: 'shown'`.
 *
 * Mostrar el código por defecto es lo que vuelve útil el canvas de la documentación para quien busca
 * un fragmento ejecutable junto a la story renderizada.
 */

/**
 * La propiedad de `key` dentro de un objeto literal, o `undefined` si no la tiene. La clave puede venir
 * como identificador o entrecomillada, y las dos formas nombran lo mismo.
 *
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
	if (node.type === 'Identifier' && scope) return resolveIdentifier(node, scope);
	return undefined;
}

/**
 * El objeto que un identificador nombra en el archivo local.
 *
 * Un import de otro módulo (`import meta from './meta.config'; export default meta`) no se resuelve:
 * su binding no tiene declarador con inicializador acá, así que el meta queda sin resolver y la regla
 * se saltea. Saltear es más seguro que marcar de más.
 *
 * @param {import('estree').Identifier} node
 * @param {import('eslint').Scope.Scope} scope
 * @returns {import('estree').ObjectExpression | undefined}
 */
function resolveIdentifier(node, scope) {
	const variable = scope.references.find((ref) => ref.identifier === node)?.resolved;
	const declarator = variable?.defs?.[0]?.node;
	if (declarator?.type !== 'VariableDeclarator') return undefined;
	const init = declarator.init;
	return init?.type === 'ObjectExpression' ? init : undefined;
}

/**
 * Reporta el primer nivel que falte en `parameters.docs.canvas.sourceState`.
 *
 * Cada nivel se verifica como objeto literal antes de descender; un valor que no lo es —un spread,
 * una llamada, una referencia a variable— se saltea en silencio para no marcar de más sobre
 * parámetros construidos dinámicamente. El costo aceptado es que esas mismas construcciones quedan
 * fuera del enforcement.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').ObjectExpression} meta
 * @param {import('estree').Node} reportNode
 */
function checkMeta(context, meta, reportNode) {
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

		return {
			ExportDefaultDeclaration(node) {
				const scope = context.sourceCode.getScope(node);
				const meta = resolveToObjectExpression(node.declaration, scope);
				if (!meta) return;
				checkMeta(context, meta, node);
			},
		};
	},
};
