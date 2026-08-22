/**
 * Reporta una `const` de módulo cuyas lecturas viven todas dentro de una misma
 * función de nivel superior: ahí va declarada. El fix es moverla, no inlinear —
 * el nombre se conserva y el archivo deja de obligar a leerlo entero para
 * descubrir quién consume la constante.
 *
 * No mira sintaxis sino el grafo de referencias (scope analysis): para cada
 * variable del scope de módulo pregunta desde dónde se la lee. Dos lecturas en
 * callbacks anidados distintos de la misma función convergen en un solo dueño;
 * lecturas en funciones distintas lo silencian, igual que cualquier lectura a
 * nivel de módulo (incluye `export { x }` y `export default x`).
 *
 * Quedan fuera del alcance:
 * - `export const`: exportado es el único proxy de "compartido" evaluable en un
 *   solo archivo. El hueco (exportado sin consumidor externo) requiere análisis
 *   cross-file y no se cubre acá.
 * - Instancias construidas (`new X()`, fábrica local, cadena fluida de
 *   métodos de dominio tipo `unified().use(...)`, `await`): están hoisteadas
 *   a propósito para evaluarse una vez; moverlas las reconstruiría por
 *   llamada. Una cadena de transformación pura de la stdlib
 *   (`env.split(',').map(...)`), en cambio, sí se reporta: deriva datos.
 * - Destructuring (`const { a } = obj`): el id no es renombrable como bloque.
 */

/** Tipos de scope que delimitan "dentro de una función". Los bloques, `for`, `switch` y clases atraviesan sin cortar. */
const FUNCTION_SCOPE_TYPES = new Set(['function', 'class-field-initializer', 'class-static-block']);

/**
 * Vocabulario de transformación de la librería estándar. Una cadena compuesta
 * solo por estos métodos deriva un valor nuevo por llamada (dato), así que se
 * reporta como cualquier computación trivial. Un eslabón de dominio sobre otra
 * llamada (`unified().use(...)`), en cambio, configura una instancia que la
 * regla no debe empujar hacia adentro.
 */
const TRANSFORM_METHODS = new Set([
	'split',
	'trim',
	'trimStart',
	'trimEnd',
	'toLowerCase',
	'toUpperCase',
	'padStart',
	'padEnd',
	'replace',
	'replaceAll',
	'slice',
	'concat',
	'join',
	'reverse',
	'flat',
	'flatMap',
	'map',
	'filter',
	'reduce',
	'reduceRight',
	'toSorted',
	'toReversed',
]);

/** Envoltorios que no cambian la naturaleza del valor: `as`, `satisfies` y `Object.freeze(...)` revelan lo de adentro. */
function unwrapValue(node) {
	if (!node) {
		return null;
	}
	if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
		return unwrapValue(node.expression);
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
		return unwrapValue(node.arguments[0]);
	}
	return node;
}

/** La declaración que envuelve un `export`, si lo hay. */
function unwrapExport(statement) {
	if (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration') {
		return statement.declaration;
	}
	return statement;
}

/**
 * Nombres declarados a nivel de módulo del propio archivo. Un `CallExpression`
 * cuyo callee es uno de estos es una fábrica local: la construcción deliberada
 * de un cache o engine que la regla no debe empujar hacia adentro. Una llamada
 * importada o a método (`process.argv.includes(...)`) no califica: es una
 * computación trivial y sí se reporta.
 */
function collectModuleLevelNames(program) {
	const names = new Set();
	for (const statement of program.body) {
		const declaration = unwrapExport(statement);
		if (!declaration) {
			continue;
		}
		if ((declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') && declaration.id) {
			names.add(declaration.id.name);
		}
		if (declaration.type === 'VariableDeclaration') {
			for (const declarator of declaration.declarations) {
				if (declarator.id.type === 'Identifier') {
					names.add(declarator.id.name);
				}
			}
		}
	}
	return names;
}

/**
 * Una cadena fluida cuyo receptor final es otra llamada (`unified().use(x)...`)
 * construye una instancia configurada e inmutable: misma familia que el
 * `new X()` cacheado a propósito, y moverla la reconstruiría por llamada.
 */
function methodName(member) {
	if (member.computed || member.property.type !== 'Identifier') {
		return null;
	}
	return member.property.name;
}

/** ¿Hay una construcción (`new`/llamada) en algún punto del subárbol? */
function containsConstruction(node) {
	if (!node) {
		return false;
	}
	if (node.type === 'CallExpression' || node.type === 'NewExpression') {
		return true;
	}
	for (const key of ['callee', 'object', 'left', 'right']) {
		if (containsConstruction(node[key])) {
			return true;
		}
	}
	return node.arguments?.some(containsConstruction) ?? false;
}

/**
 * El callee encadena un método de dominio sobre otra llamada: instancia
 * configurada. Las cadenas de transformación puras (solo `TRANSFORM_METHODS`
 * hasta su base) no califican: son derivación de datos.
 */
function isConfiguredInstance(callee) {
	let current = callee;
	while (current?.type === 'MemberExpression') {
		const method = methodName(current);
		if (!TRANSFORM_METHODS.has(method ?? '') && containsConstruction(current.object)) {
			return true;
		}
		current = current.object;
	}
	return false;
}

/** El valor debajo de los envoltorios, clasificado como construcción deliberada o no. */
function isDeliberatelyConstructed(value, moduleLevelNames) {
	if (value.type === 'NewExpression' || value.type === 'AwaitExpression') {
		return true;
	}
	if (value.type !== 'CallExpression') {
		return false;
	}
	if (isConfiguredInstance(value.callee)) {
		return true;
	}
	return value.callee.type === 'Identifier' && moduleLevelNames.has(value.callee.name);
}

/**
 * Elegibilidad estructural de la variable: `const` nombrada, con inicializador,
 * no exportada inline. `let`/`var` pueden reasignarse (moverlas cambia la
 * semántica) y las destructuradas no tienen un nombre único que mover.
 */
function isCandidate(definition) {
	return (
		definition?.type === 'Variable' &&
		definition.parent.kind === 'const' &&
		definition.parent.parent?.type !== 'ExportNamedDeclaration' &&
		Boolean(definition.node.init) &&
		definition.node.id.type === 'Identifier'
	);
}

/**
 * La función de nivel superior dueña de un scope: se sube hasta el módulo y se
 * conserva la ÚLTIMA función del camino, así dos lecturas en callbacks anidados
 * distintos de la misma función convergen en el mismo dueño. `null` significa
 * lectura a nivel de módulo.
 */
function topLevelFunctionOf(scope) {
	let current = scope;
	let owner = null;
	while (current && current.type !== 'module' && current.type !== 'global') {
		if (FUNCTION_SCOPE_TYPES.has(current.type)) {
			owner = current;
		}
		current = current.upper;
	}
	return owner;
}

/** Nombre legible del dueño, para que el mensaje señale dónde mover la constante. */
function ownerName(owner) {
	const fn = owner.block;
	if (fn.id?.name) {
		return fn.id.name;
	}
	const parent = fn.parent;
	if (!parent) {
		return null;
	}
	if (parent.type === 'VariableDeclarator') {
		return parent.id?.name ?? null;
	}
	if (parent.type === 'AssignmentExpression') {
		return parent.left?.name ?? null;
	}
	if (parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition' || parent.type === 'Property') {
		return parent.key?.name ?? null;
	}
	return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow module-level consts whose reads all live in a single top-level function; move the const into that function.',
		},
		schema: [],
		messages: {
			movable:
				'Move `{{name}}` into `{{owner}}` — every read lives in that single function, so the module-level declaration forces reading the whole file to find its only consumer. See typescript.md.',
		},
	},
	create(context) {
		const sourceCode = context.sourceCode ?? context.getSourceCode();

		return {
			'Program:exit'(program) {
				const moduleScope = sourceCode.scopeManager.scopes[0]?.childScopes.find((scope) => scope.type === 'module');
				if (!moduleScope) {
					return;
				}

				const moduleLevelNames = collectModuleLevelNames(program);

				for (const variable of moduleScope.variables) {
					const definition = variable.defs[0];
					if (!isCandidate(definition)) {
						continue;
					}
					const value = unwrapValue(definition.node.init);
					if (!value || isDeliberatelyConstructed(value, moduleLevelNames)) {
						continue;
					}

					const reads = variable.references.filter((reference) => !reference.init && !reference.isWrite());
					if (reads.length === 0) {
						continue;
					}

					const owners = reads.map((reference) => topLevelFunctionOf(reference.from));
					// Una lectura a nivel de módulo alimenta otra constante o maquinaria de export:
					// moverla rompería su consumo, así que cualquier `null` silencia.
					if (owners.some((owner) => owner === null)) {
						continue;
					}

					if (owners.every((owner) => owner === owners[0])) {
						context.report({
							node: definition.node,
							messageId: 'movable',
							data: { name: definition.node.id.name, owner: ownerName(owners[0]) ?? 'the function that reads it' },
						});
					}
				}
			},
		};
	},
};
