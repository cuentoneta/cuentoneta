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
 *   métodos de dominio tipo `unified().use(...)`, `await`), literales que
 *   llevan una construcción adentro y métodos que mutan su receptor
 *   (`sort`, `reverse`, …): están hoisteadas a propósito para evaluarse una
 *   vez; moverlas las reconstruiría por llamada o re-mutaría su receptor.
 *   Una cadena de transformación pura de la stdlib
 *   (`env.split(',').map(...)`), en cambio, sí se reporta: deriva datos.
 * - Destructuring (`const { a } = obj`): el id no es renombrable como bloque.
 */

/** Tipos de scope que delimitan "dentro de una función". Los bloques, `for`, `switch` y clases atraviesan sin cortar. */
const FUNCTION_SCOPE_TYPES = new Set(['function', 'class-field-initializer', 'class-static-block']);
/** Tipos de scope donde termina el ascenso: no hay función contenedora que sea dueña. */
const TERMINAL_SCOPE_TYPES = new Set(['module', 'global']);
/** Envoltorios que no cambian la naturaleza del valor: revelan lo que hay debajo. */
const VALUE_REVEALERS = new Set(['TSAsExpression', 'TSSatisfiesExpression']);
/** Nodos que por sí solos ya son una construcción deliberada al tope del initializer. */
const CONSTRUCTED_TYPES = new Set(['NewExpression', 'AwaitExpression']);
/**
 * Nodos que, en el ESCÁNER DE SUBÁRBOLES, cuentan como construcción: acá
 * cualquier llamada califica — un literal que llama algo se evalúa una vez a
 * propósito, sea `new RegExp(...)` o `buildEngine()`. Es más amplio que
 * `CONSTRUCTED_TYPES` a propósito: el despacho del tope decide después con sus
 * propias estrategias.
 */
const CONSTRUCTION_SCAN_TYPES = new Set(['CallExpression', 'NewExpression', 'AwaitExpression']);
/**
 * Cuerpos de función: sus llamadas son DIFERIDAS (corren al invocar, no al
 * evaluar el initializer), así que mover el literal no las re-ejecuta. El
 * escáner las atraviesa sin descender: `{ load: () => client.fetch(id) }` es
 * dato movible; `{ pattern: new RegExp('x') }`, construcción exenta.
 */
const DEFERRED_EXECUTION_TYPES = new Set(['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration']);

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
	'flat',
	'flatMap',
	'map',
	'filter',
	'reduce',
	'reduceRight',
	'toSorted',
	'toReversed',
]);

/**
 * Métodos que mutan su receptor y devuelven la misma referencia. Mover una
 * constante inicializada con ellos re-mutaría el valor original en cada
 * llamada: se eximen igual que las instancias construidas, porque seguir el
 * mensaje de la regla sería incorrecto. La derivación legítima usa sus
 * contrapartidas puras (`toSorted`, `toReversed`, …), que sí se reportan.
 */
const MUTATING_METHODS = new Set(['sort', 'reverse', 'splice', 'fill', 'copyWithin']);

/** Estrategias de clasificación por tipo de initializer: qué cuenta como construcción deliberada. */
const CONSTRUCTION_STRATEGIES = new Map([
	['NewExpression', () => true],
	['AwaitExpression', () => true],
	// Un literal con una construcción adentro se evalúa una vez a propósito:
	// moverlo la reconstruiría por lectura, igual que si estuviera desnuda.
	['ObjectExpression', containsConstruction],
	['ArrayExpression', containsConstruction],
]);

/** Extractores del nombre declarado por cada tipo de declaración de módulo. */
const DECLARED_NAME_EXTRACTORS = new Map([
	['FunctionDeclaration', (declaration) => (declaration.id ? [declaration.id.name] : [])],
	['ClassDeclaration', (declaration) => (declaration.id ? [declaration.id.name] : [])],
	[
		'VariableDeclaration',
		(declaration) => declaration.declarations.flatMap(({ id }) => (id.type === 'Identifier' ? [id.name] : [])),
	],
]);

/** Extractores del nombre de la función dueña según cómo esté declarada. */
const namedKey = (parent) => parent.key?.name ?? null;
const OWNER_NAME_EXTRACTORS = new Map([
	['VariableDeclarator', (parent) => parent.id?.name ?? null],
	['AssignmentExpression', (parent) => parent.left?.name ?? null],
	['MethodDefinition', namedKey],
	['PropertyDefinition', namedKey],
	['Property', namedKey],
]);

function unwrapValue(node) {
	if (!node) {
		return null;
	}
	if (VALUE_REVEALERS.has(node.type)) {
		return unwrapValue(node.expression);
	}
	if (
		node.type === 'CallExpression' &&
		node.callee.object?.name === 'Object' &&
		node.callee.property?.name === 'freeze' &&
		node.arguments.length > 0
	) {
		return unwrapValue(node.arguments[0]);
	}
	return node;
}

/**
 * ¿Hay una construcción (`new`/llamada) en algún punto del subárbol? El
 * recorrido usa las `visitorKeys` del parser —las mismas claves por tipo que
 * usa su propio traverser—, así que cubre cualquier shape de literal (TS
 * incluido) sin entrar jamás en el puntero `parent`, que es donde un recorrido
 * genérico por propiedades cicla.
 */
function containsConstruction(node, visitorKeys) {
	if (!node) {
		return false;
	}
	if (CONSTRUCTION_SCAN_TYPES.has(node.type)) {
		return true;
	}
	return (visitorKeys[node.type] ?? []).some((key) => {
		const child = node[key];
		return Array.isArray(child)
			? child.some(
					(entry) =>
						entry?.type && !DEFERRED_EXECUTION_TYPES.has(entry.type) && containsConstruction(entry, visitorKeys),
				)
			: Boolean(child?.type) && !DEFERRED_EXECUTION_TYPES.has(child.type) && containsConstruction(child, visitorKeys);
	});
}

function methodName(member) {
	return member.computed || member.property.type !== 'Identifier' ? null : member.property.name;
}

/** Los eslabones de una cadena de llamadas miembro, con su receptor debajo de cada uno. */
function memberLinks(callee) {
	const links = [];
	for (let current = callee; current?.type === 'MemberExpression'; current = current.object) {
		links.push({ method: methodName(current), receiver: current.object });
	}
	return links;
}

/**
 * El callee encadena un método de dominio sobre otra llamada, o un método que
 * muta su receptor: instancia cuya re-construcción por llamada cambia el
 * comportamiento. Las cadenas de transformación puras (solo `TRANSFORM_METHODS`
 * hasta su base) no califican: son derivación de datos.
 */
function isConfiguredInstance(callee, visitorKeys) {
	return memberLinks(callee).some(
		({ method, receiver }) =>
			MUTATING_METHODS.has(method) || (!TRANSFORM_METHODS.has(method) && containsConstruction(receiver, visitorKeys)),
	);
}

function isLocalFactory(callee, moduleLevelNames) {
	return callee.type === 'Identifier' && moduleLevelNames.has(callee.name);
}

/** El valor debajo de los envoltorios, clasificado como construcción deliberada o no. */
function isDeliberatelyConstructed(value, moduleLevelNames, visitorKeys) {
	const strategy = CONSTRUCTION_STRATEGIES.get(value.type);

	if (strategy) {
		return strategy(value, visitorKeys);
	}
	if (value.type !== 'CallExpression') {
		return false;
	}
	return isConfiguredInstance(value.callee, visitorKeys) || isLocalFactory(value.callee, moduleLevelNames);
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

function collectModuleLevelNames(program) {
	return new Set(
		program.body
			.map((statement) => statement.declaration ?? statement)
			.flatMap((declaration) => DECLARED_NAME_EXTRACTORS.get(declaration.type)?.(declaration) ?? []),
	);
}

/**
 * La función de nivel superior dueña de un scope: se sube hasta el módulo y se
 * conserva la ÚLTIMA función del camino, así dos lecturas en callbacks anidados
 * distintos de la misma función convergen en el mismo dueño. `null` significa
 * lectura a nivel de módulo.
 */
function topLevelFunctionOf(scope) {
	let owner = null;
	for (let current = scope; current && !TERMINAL_SCOPE_TYPES.has(current.type); current = current.upper) {
		owner = FUNCTION_SCOPE_TYPES.has(current.type) ? current : owner;
	}
	return owner;
}

/** Nombre legible del dueño, para que el mensaje señale dónde mover la constante. */
function ownerName(owner) {
	const fn = owner.block;
	if (fn.id?.name) {
		return fn.id.name;
	}
	return OWNER_NAME_EXTRACTORS.get(fn.parent?.type)?.(fn.parent) ?? null;
}

function readsOf(variable) {
	return variable.references.filter((reference) => !reference.init && !reference.isWrite());
}

/**
 * El dueño único de todas las lecturas, si existe: cualquier lectura a nivel de
 * módulo alimenta otra constante o maquinaria de export — moverla rompería su
 * consumo — y dos funciones consumidoras distintas lo silencian igual.
 */
function soleOwnerOf(reads) {
	const owners = reads.map((reference) => topLevelFunctionOf(reference.from));
	const [first] = owners;
	// Sin lecturas no hay dueño; `first` sería `undefined` y `undefined !== null` no lo filtra.
	const converges = owners.length > 0 && first !== null && owners.every((owner) => owner === first);
	return converges ? first : null;
}

function reportMovableConsts(moduleScope, program, context, visitorKeys) {
	const moduleLevelNames = collectModuleLevelNames(program);

	for (const variable of moduleScope.variables) {
		const definition = variable.defs[0];
		const value = unwrapValue(definition?.node.init);
		const reads =
			isCandidate(definition) && !isDeliberatelyConstructed(value, moduleLevelNames, visitorKeys)
				? readsOf(variable)
				: [];
		const owner = soleOwnerOf(reads);

		if (owner !== null) {
			context.report({
				node: definition.node,
				messageId: 'movable',
				data: {
					name: definition.node.id.name,
					owner: ownerName(owner) ?? 'the function that reads it',
				},
			});
		}
	}
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
		const { visitorKeys } = sourceCode;

		return {
			// El análisis de scopes está completo antes de que corran los visitors, así
			// que en `Program:exit` el grafo de referencias ya está cerrado. Un archivo
			// sin scope de módulo (fuente no-module) simplemente no produce candidatos.
			'Program:exit'(program) {
				sourceCode.scopeManager.scopes
					.filter((scope) => scope.type === 'module')
					.forEach((moduleScope) => reportMovableConsts(moduleScope, program, context, visitorKeys));
			},
		};
	},
};
