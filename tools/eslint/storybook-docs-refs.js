/**
 * Obliga a que la prosa de autodocs referencie el catálogo y el código por símbolos, no por texto escrito
 * a mano.
 *
 * El `title` de una story y los enlaces y nombres que otras stories escriben sobre ella describen la
 * misma entrada, pero escritos a mano son copias que se desincronizan sin emitir señal: `storybook:build`
 * compila la prosa sin ejecutarla, así que un componente borrado sigue nombrado y un `kind-id` mal
 * tipeado sigue enlazado. Con la referencia puesta en el módulo `*.docs.ts` de la entrada, el nombre
 * visible y el `kind-id` salen del mismo `title` y borrar la entrada rompe el `typecheck` del referente.
 * Una clase Angular sin entrada propia se nombra por su clase y se declara en la tupla `DocsSymbols` de
 * la story, que cumple el mismo papel: borrar la clase rompe el `typecheck`.
 *
 * El `title` del `meta` sigue siendo un literal porque el indexador CSF de Storybook lo exige —leerlo de
 * la entrada falla el build con `unexpected dynamic title`—, así que la copia existe por obligación
 * ajena y lo que hace esta regla es no dejar que se separe de la entrada.
 *
 * Los chequeos son sintácticos o de igualdad exacta contra el árbol: no clasifican qué texto "parece" un
 * símbolo, y por eso no hay allowlist que mantener. Una palabra en prosa que casualmente esté en
 * PascalCase (`Playground`, `OnGray`) no coincide con ninguna entrada ni con ninguna clase y no se mira.
 * Un símbolo que no es una clase Angular (un modelo, un tipo) puede declararse en `DocsSymbols`, pero la
 * regla no lo exige.
 */
import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/** @typedef {import('@typescript-eslint/utils').TSESTree.Node} TsNode */
/** @typedef {import('@typescript-eslint/utils').TSESTree.Program} TsProgram */
/** @typedef {import('@typescript-eslint/utils').TSESTree.TSTupleType} TsTupleType */

/**
 * Lo que la regla sabe del árbol. `catalog` son los nombres con los que el catálogo publica sus entradas
 * (el último segmento de cada `title`); `angularClasses`, las clases exportadas por un archivo de
 * `src/app/` que declara un componente, una directiva, un pipe o un servicio.
 *
 * @typedef {{ catalog: ReadonlySet<string>; angularClasses: ReadonlySet<string> }} TreeSnapshot
 */

const DOCS_ENTRY_GLOB = 'src/app/**/*.docs.ts';
const APP_SOURCE_GLOB = 'src/app/**/*.ts';
const NON_SOURCE_SUFFIXES = ['.spec.ts', '.stories.ts', '.docs.ts'];
const ENTRY_DECLARATION = /title:\s*(['"`])(.+?)\1/;
const ANGULAR_DECORATOR = /@(?:Component|Directive|Pipe|Injectable|Service)\(/;
const EXPORTED_CLASS = /export\s+(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/g;
const KIND_ID_LITERAL = /path=\/docs\//;
const NAMED_TAG = /<(strong|code)>([^<]+)<\/\1>/g;
const SYMBOLS_TUPLE = 'DocsSymbols';

/** @type {{ signature: string; snapshot: TreeSnapshot } | undefined} */
let cached;

/**
 * El `title` que declara un módulo de entrada, o `undefined` si no lo declara.
 *
 * @param {string} path
 * @returns {string | undefined}
 */
function entryTitle(path) {
	return readFileSync(path, 'utf8').match(ENTRY_DECLARATION)?.[2];
}

/**
 * @param {readonly string[]} entryPaths
 * @returns {Set<string>}
 */
function catalogNames(entryPaths) {
	const names = new Set();
	for (const path of entryPaths) {
		const title = entryTitle(path);
		if (title) names.add(title.slice(title.lastIndexOf('/') + 1));
	}
	return names;
}

/**
 * @param {readonly string[]} sourcePaths
 * @returns {Set<string>}
 */
function angularClassNames(sourcePaths) {
	const names = new Set();
	for (const path of sourcePaths) {
		const source = readFileSync(path, 'utf8');
		if (!ANGULAR_DECORATOR.test(source)) continue;
		for (const [, name] of source.matchAll(EXPORTED_CLASS)) names.add(name);
	}
	return names;
}

/**
 * El estado del árbol visto desde `cwd`. Se recalcula cuando cambia alguno de los archivos de los que
 * sale —por nombre o por fecha de modificación—, así un proceso de larga vida como el ESLint del editor
 * no sigue validando contra un catálogo que ya no existe.
 *
 * @param {string} cwd
 * @returns {TreeSnapshot}
 */
function readTree(cwd) {
	const toAbsolute = (/** @type {string} */ file) => resolve(cwd, file);
	const entryPaths = globSync(DOCS_ENTRY_GLOB, { cwd }).map(toAbsolute);
	const sourcePaths = globSync(APP_SOURCE_GLOB, { cwd })
		.filter((file) => !NON_SOURCE_SUFFIXES.some((suffix) => file.endsWith(suffix)))
		.map(toAbsolute);
	// Un archivo borrado entre el glob y el stat —el editor guardando en medio de una pasada— no debe
	// tumbar la regla: firma con 0 y la pasada siguiente lo saca de la lista.
	const signature = [...entryPaths, ...sourcePaths]
		.map((path) => `${path}@${statSync(path, { throwIfNoEntry: false })?.mtimeMs ?? 0}`)
		.join('|');
	if (cached?.signature !== signature) {
		cached = {
			signature,
			snapshot: { catalog: catalogNames(entryPaths), angularClasses: angularClassNames(sourcePaths) },
		};
	}
	return cached.snapshot;
}

/**
 * El texto de un literal de string, o el de un template literal con sus sustituciones vaciadas.
 *
 * @param {import('estree').Literal | import('estree').TemplateLiteral} node
 * @returns {string}
 */
function literalText(node) {
	if (node.type === 'Literal') return typeof node.value === 'string' ? node.value : '';
	return node.quasis.map((quasi) => quasi.value.raw).join('');
}

/**
 * La tupla `DocsSymbols` que declara la story, exportada o no.
 *
 * @param {TsProgram} program
 * @returns {TsTupleType | undefined}
 */
function symbolsTuple(program) {
	for (const statement of program.body) {
		const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
		const isTuple =
			declaration?.type === 'TSTypeAliasDeclaration' &&
			declaration.id.name === SYMBOLS_TUPLE &&
			declaration.typeAnnotation.type === 'TSTupleType';
		if (isTuple) return /** @type {TsTupleType} */ (declaration.typeAnnotation);
	}
	return undefined;
}

/**
 * Los nombres que declara la tupla `DocsSymbols` de la story; vacío si no la tiene.
 *
 * @param {TsProgram} program
 * @returns {Set<string>}
 */
function declaredSymbols(program) {
	const names = new Set();
	for (const element of symbolsTuple(program)?.elementTypes ?? []) {
		if (element.type === 'TSTypeReference' && element.typeName.type === 'Identifier') {
			names.add(element.typeName.name);
		}
	}
	return names;
}

/**
 * El mensaje que corresponde a un nombre puesto en la prosa, o `undefined` si no hay nada que reportar.
 * Una entrada del catálogo gana sobre la clase homónima: su nombre sale de la entrada, no de la tupla.
 *
 * @param {string} name
 * @param {TreeSnapshot} tree
 * @param {ReadonlySet<string>} declared
 * @returns {'literalMention' | 'undeclaredSymbol' | undefined}
 */
function namedTagViolation(name, tree, declared) {
	if (tree.catalog.has(name)) return 'literalMention';
	if (tree.angularClasses.has(name) && !declared.has(name)) return 'undeclaredSymbol';
	return undefined;
}

/**
 * Reporta si falta el módulo de entrada de la story o si su `title` difiere del literal del meta.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').Property} node
 * @param {string} docsPath
 */
function checkMetaTitle(context, node, docsPath) {
	const declared = existsSync(docsPath) ? entryTitle(docsPath) : undefined;
	if (declared === undefined) {
		context.report({ node, messageId: 'missingEntry', data: { file: docsPath.split('/').pop() ?? docsPath } });
		return;
	}
	const metaTitle = node.value.type === 'Literal' ? node.value.value : undefined;
	if (declared === metaTitle) return;
	context.report({
		node,
		messageId: 'titleMismatch',
		data: { meta: JSON.stringify(metaTitle), entry: JSON.stringify(declared) },
	});
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Referenciar el catálogo de autodocs y las clases Angular por símbolos, no por texto escrito a mano',
		},
		schema: [],
		messages: {
			literalKindId:
				'Enlace de autodocs escrito a mano. Usá `${docsRef(<entrada>Docs)}` —o `docsLink` si el texto del enlace es propio—, que deriva el `kind-id` del `title` de la entrada.',
			literalMention:
				'`{{ name }}` es una entrada del catálogo nombrada a mano. Usá `${docsMention(<entrada>Docs)}` para que el nombre muera con la entrada.',
			undeclaredSymbol:
				'`{{ name }}` es una clase Angular nombrada en la prosa sin figurar en `DocsSymbols`. Sumala a la tupla para que borrarla rompa el `typecheck` de esta story.',
			missingEntry:
				'Falta el módulo de entrada `{{ file }}`, que declara el `title` del que las otras stories derivan el nombre y el enlace de esta.',
			titleMismatch:
				'El `title` del meta ({{ meta }}) no coincide con el de su entrada ({{ entry }}). El indexador CSF exige el literal acá, así que la entrada es la que manda: alineá los dos.',
		},
	},
	create(context) {
		const filename = context.filename.split('\\').join('/');
		if (!filename.endsWith('.stories.ts')) return {};
		const tree = readTree(context.cwd);
		const docsPath = filename.replace(/\.stories\.ts$/, '.docs.ts');
		/** @type {{ node: import('estree').Node; name: string }[]} */
		const namedTags = [];

		return {
			/** @param {import('estree').Literal | import('estree').TemplateLiteral} node */
			'Literal, TemplateLiteral'(node) {
				const text = literalText(node);
				if (KIND_ID_LITERAL.test(text)) context.report({ node, messageId: 'literalKindId' });
				for (const [, , raw] of text.matchAll(NAMED_TAG)) namedTags.push({ node, name: raw.trim() });
			},
			// Solo el `title` del meta: el de los datos de una story (títulos de obra, de colección) no es una
			// entrada del catálogo. Se distingue por vivir en el objeto que declara `component`.
			/** @param {import('estree').Property & import('eslint').Rule.NodeParentExtension} node */
			"Property[key.name='title'][value.type='Literal']"(node) {
				const { parent } = node;
				const isMeta =
					parent.type === 'ObjectExpression' &&
					parent.properties.some(
						(prop) => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'component',
					);
				if (isMeta) checkMetaTitle(context, node, docsPath);
			},
			// Se reporta al final porque la tupla puede declararse después de la prosa que la necesita.
			/** @param {import('estree').Program} program */
			'Program:exit'(program) {
				const declared = declaredSymbols(/** @type {TsProgram} */ (/** @type {unknown} */ (program)));
				for (const { node, name } of namedTags) {
					const messageId = namedTagViolation(name, tree, declared);
					if (messageId) context.report({ node, messageId, data: { name } });
				}
			},
		};
	},
};
