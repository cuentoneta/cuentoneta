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

/** La declaración que envuelve un `export`, si lo hay. Cubre nombrado y default. */
function unwrapExport(statement) {
	if (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration') {
		return statement.declaration;
	}
	return statement;
}

function hasClassDecorator(program) {
	return program.body.some((statement) => {
		const declaration = unwrapExport(statement);
		if (declaration?.type !== 'ClassDeclaration') {
			return false;
		}
		return (declaration.decorators ?? []).some((decorator) => DECORATORS.has(decoratorName(decorator)));
	});
}

/**
 * El literal que hay debajo de los envoltorios que no cambian su naturaleza:
 * `Object.freeze(...)`, `as const`, `as Foo` y `satisfies Foo`. Sin desenvolverlos,
 * cualquiera de ellos alcanzaría para eludir la regla.
 */
function unwrapConfig(node) {
	if (!node) {
		return null;
	}
	if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
		return unwrapConfig(node.expression);
	}
	if (
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 'Object' &&
		node.callee.property.type === 'Identifier' &&
		node.callee.property.name === 'freeze' &&
		node.arguments.length > 0
	) {
		return unwrapConfig(node.arguments[0]);
	}
	return node;
}

/**
 * Los nombres que un `type` del archivo deriva con `typeof`. Es el sustituto de
 * `enum` que exigen las restricciones duras (`Object.freeze({...} as const)` más
 * su tipo homónimo), y **no puede** vivir en la instancia: un alias de tipo no
 * puede derivarse de un campo, así que el `const` debe estar a nivel de módulo.
 */
function namesUsedByTypeAliases(program, sourceCode) {
	const derived = new Set();
	for (const statement of program.body) {
		const declaration = unwrapExport(statement);
		if (declaration?.type !== 'TSTypeAliasDeclaration') {
			continue;
		}
		for (const token of sourceCode.getTokens(declaration)) {
			if (token.type === 'Identifier') {
				derived.add(token.value);
			}
		}
	}
	return derived;
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
		const sourceCode = context.sourceCode ?? context.getSourceCode();

		return {
			Program(program) {
				if (!hasClassDecorator(program)) {
					return;
				}

				const derivedNames = namesUsedByTypeAliases(program, sourceCode);

				for (const statement of program.body) {
					// Un `const` exportado es API compartida, no configuración privada del archivo.
					if (statement.type !== 'VariableDeclaration' || statement.kind !== 'const') {
						continue;
					}

					for (const declarator of statement.declarations) {
						const initializer = unwrapConfig(declarator.init);
						if (!initializer || !CONFIG_INITIALIZERS.has(initializer.type)) {
							continue;
						}
						if (declarator.id.type !== 'Identifier' || derivedNames.has(declarator.id.name)) {
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
