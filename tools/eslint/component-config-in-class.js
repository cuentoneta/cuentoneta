/**
 * Prohíbe declarar la configuración propia de un componente, directiva o servicio
 * como `const` a nivel de módulo. Un mapa `size → clase`, una tabla de widgets o
 * una tabla de estilos son estado de la clase que los usa: van como
 * `private readonly` de instancia y se consumen con `this.`.
 *
 * El prior de Angular/TS empuja fuerte hacia el `const` de módulo, así que la
 * convención reaparecía cada tanto pese a estar acordada.
 *
 * Solo mira archivos que declaren `@Component`, `@Directive` o `@Injectable`: en
 * un archivo sin decorador, un `const` de módulo es lo correcto.
 */

const DECORATORS = new Set(['Component', 'Directive', 'Injectable']);
const CONFIG_INITIALIZERS = new Set(['ObjectExpression', 'ArrayExpression']);

/** El nombre del decorador de una expresión `@X(...)` o `@X`. */
function decoratorName(decorator) {
	const expression = decorator.expression;
	if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
		return expression.callee.name;
	}
	return expression.type === 'Identifier' ? expression.name : null;
}

function hasClassDecorator(program) {
	return program.body.some((statement) => {
		const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
		if (declaration?.type !== 'ClassDeclaration') {
			return false;
		}
		return (declaration.decorators ?? []).some((decorator) => DECORATORS.has(decoratorName(decorator)));
	});
}

/**
 * `Object.freeze({...})` y `Object.freeze([...])` también son configuración: sin
 * desenvolverlos, envolver el literal alcanzaría para eludir la regla.
 */
function unwrapFreeze(node) {
	if (
		node?.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 'Object' &&
		node.callee.property.type === 'Identifier' &&
		node.callee.property.name === 'freeze' &&
		node.arguments.length > 0
	) {
		return node.arguments[0];
	}
	return node;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow module-level object/array consts in files declaring @Component, @Directive or @Injectable; move them to a private readonly instance field.',
		},
		schema: [],
		messages: {
			moduleConfig:
				'Move `{{name}}` into the class as `private readonly {{name}}` and read it with `this.{{name}}` — component/service config is class state, not module state. See angular-components.md.',
		},
	},
	create(context) {
		return {
			Program(program) {
				if (!hasClassDecorator(program)) {
					return;
				}

				for (const statement of program.body) {
					// Un `const` exportado es API compartida, no configuración privada del archivo.
					if (statement.type !== 'VariableDeclaration' || statement.kind !== 'const') {
						continue;
					}

					for (const declarator of statement.declarations) {
						const initializer = unwrapFreeze(declarator.init);
						if (!initializer || !CONFIG_INITIALIZERS.has(initializer.type)) {
							continue;
						}
						if (declarator.id.type !== 'Identifier') {
							continue;
						}
						context.report({
							node: declarator,
							messageId: 'moduleConfig',
							data: { name: declarator.id.name },
						});
					}
				}
			},
		};
	},
};
