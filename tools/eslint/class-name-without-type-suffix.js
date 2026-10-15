/**
 * Rechaza el sufijo de tipo en el nombre de una clase `@Directive` o `@Pipe`: se llama `Tooltip`, no
 * `TooltipDirective`. El decorador ya dice qué es la clase, y el uso real es por selector o por `name`, no
 * por el nombre de la clase. Los componentes los cubre `component-location-and-name`; la convención y su
 * porqué: `angular-components.md#nombre-de-directivas-y-pipes`.
 *
 * El alcance es la lista de decoradores de `repeatedSuffix` y no una opción: sumar uno (los servicios, por
 * ejemplo, donde `Service` es un rol de arquitectura) es una decisión que tiene que verse en el diff. Sin
 * autofix, porque renombrar una clase obliga a tocar sus referencias en otros archivos.
 *
 * Los specs y las stories quedan afuera enteros: sus clases son andamiaje de un solo archivo.
 */

/** @typedef {import('@typescript-eslint/utils').TSESTree.ClassDeclaration} ClassDeclaration */
/** @typedef {import('@typescript-eslint/utils').TSESTree.Decorator} Decorator */

/**
 * El nombre del decorador, escrito con o sin llamada (`@Directive()` y `@Directive`).
 *
 * @param {Decorator} decorator
 */
function decoratorName(decorator) {
	const { expression } = decorator;
	const callee = expression.type === 'CallExpression' ? expression.callee : expression;
	return callee.type === 'Identifier' ? callee.name : undefined;
}

/**
 * El sufijo que repite el decorador de la clase, o `undefined` si ninguno de sus decoradores está en la
 * lista. El sufijo es el propio nombre del decorador: `@Directive` repite `Directive`.
 *
 * @param {ClassDeclaration} node
 */
function repeatedSuffix(node) {
	const typeDecorators = ['Directive', 'Pipe'];
	return (node.decorators ?? []).map(decoratorName).find((name) => name && typeDecorators.includes(name));
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Rechaza el sufijo de tipo en el nombre de las clases @Directive y @Pipe.',
		},
		schema: [],
		messages: {
			typeSuffix:
				'`{{name}}` lleva el sufijo `{{suffix}}`, que repite su decorador: la clase se nombra sin él (`{{expected}}`) — ver angular-components.md#nombre-de-directivas-y-pipes.',
		},
	},
	create(context) {
		if (/\.(spec|stories)\.ts$/.test(context.filename)) {
			return {};
		}
		return {
			ClassDeclaration(node) {
				// Los tipos de `eslint` describen ESTree, que no conoce los decoradores: se lee el AST que el
				// parser de TypeScript realmente entrega.
				const suffix = repeatedSuffix(/** @type {ClassDeclaration} */ (/** @type {unknown} */ (node)));
				const name = node.id?.name;
				// Una clase que se llama exactamente como el sufijo no tiene un nombre del que derivar el otro.
				if (!suffix || !name || name === suffix || !name.endsWith(suffix)) {
					return;
				}
				context.report({
					node: node.id ?? node,
					messageId: 'typeSuffix',
					data: { name, suffix, expected: name.slice(0, -suffix.length) },
				});
			},
		};
	},
};
