/**
 * Obliga a que la prosa de autodocs referencie el catálogo por su entrada, no por texto escrito a mano.
 *
 * El `title` de una story y los enlaces y nombres que otras stories escriben sobre ella describen la
 * misma entrada, pero escritos a mano son copias que se desincronizan sin emitir señal: `storybook:build`
 * compila la prosa sin ejecutarla, así que un componente borrado sigue nombrado y un `kind-id` mal
 * tipeado sigue enlazado. Con la referencia puesta en el módulo `*.docs.ts` de la entrada, el nombre
 * visible y el `kind-id` salen del mismo `title` y borrar la entrada rompe el `typecheck` del referente.
 *
 * El `title` del `meta` sigue siendo un literal porque el indexador CSF de Storybook lo exige —leerlo de
 * la entrada falla el build con `unexpected dynamic title`—, así que la copia existe por obligación
 * ajena y lo que hace esta regla es no dejar que se separe de la entrada.
 *
 * Los tres chequeos son sintácticos o de igualdad exacta: no clasifican qué texto "parece" un símbolo,
 * y por eso no hay allowlist que mantener. Una palabra en prosa que casualmente esté en PascalCase
 * (`Playground`, `OnGray`) no coincide con ningún `title` del catálogo y no se mira.
 *
 * El catálogo se lee del disco, como la escala de apilamiento en `z-index-scale`: la fuente de verdad
 * es el árbol de módulos `*.docs.ts`, y la regla pregunta ahí en vez de repetir la lista.
 */
import { existsSync, globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DOCS_ENTRY_GLOB = 'src/app/**/*.docs.ts';
const ENTRY_DECLARATION = /title: '([^']+)'/;
const KIND_ID_LITERAL = /path=\/docs\//;
const STRONG_MENTION = /<strong>([^<]+)<\/strong>/g;

let cachedNames;

/** El `title` que declara un módulo de entrada, o `undefined` si el archivo no existe o no lo declara. */
function entryTitle(path) {
	if (!existsSync(path)) return undefined;
	return readFileSync(path, 'utf8').match(ENTRY_DECLARATION)?.[1];
}

/**
 * Los nombres con los que el catálogo publica sus entradas: el último segmento de cada `title`.
 * Se lee una sola vez por proceso — la regla corre sobre decenas de stories y el catálogo no cambia
 * en el medio.
 */
function catalogNames(cwd) {
	if (cachedNames) return cachedNames;
	cachedNames = new Set();
	for (const file of globSync(DOCS_ENTRY_GLOB, { cwd })) {
		const title = entryTitle(resolve(cwd, file));
		if (title) cachedNames.add(title.slice(title.lastIndexOf('/') + 1));
	}
	return cachedNames;
}

/** El texto de un literal de string, o el de un template literal con sus sustituciones vaciadas. */
function literalText(node) {
	if (node.type === 'Literal') return typeof node.value === 'string' ? node.value : '';
	return node.quasis.map((quasi) => quasi.value.raw).join('');
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Referenciar el catálogo de autodocs por su módulo *.docs.ts, no por texto escrito a mano',
		},
		schema: [],
		messages: {
			literalKindId:
				'Enlace de autodocs escrito a mano. Usá `${docsRef(<entrada>Docs)}` —o `docsLink` si el texto del enlace es propio—, que deriva el `kind-id` del `title` de la entrada.',
			literalMention:
				'`{{ name }}` es una entrada del catálogo nombrada a mano. Usá `${docsMention(<entrada>Docs)}` para que el nombre muera con la entrada.',
			missingEntry:
				'Falta el módulo de entrada `{{ file }}`, que declara el `title` del que las otras stories derivan el nombre y el enlace de esta.',
			titleMismatch:
				'El `title` del meta ({{ meta }}) no coincide con el de su entrada ({{ entry }}). El indexador CSF exige el literal acá, así que la entrada es la que manda: alineá los dos.',
		},
	},
	create(context) {
		const filename = (context.filename ?? context.getFilename()).split('\\').join('/');
		if (!filename.endsWith('.stories.ts')) return {};
		const names = catalogNames(context.cwd ?? process.cwd());
		const docsPath = filename.replace(/\.stories\.ts$/, '.docs.ts');

		return {
			'Literal, TemplateLiteral'(node) {
				const text = literalText(node);
				if (text === '') return;
				if (KIND_ID_LITERAL.test(text)) context.report({ node, messageId: 'literalKindId' });
				for (const [, raw] of text.matchAll(STRONG_MENTION)) {
					const name = raw.trim();
					if (names.has(name)) context.report({ node, messageId: 'literalMention', data: { name } });
				}
			},
			"Property[key.name='title'][value.type='Literal']"(node) {
				// Solo el `title` del meta: el de los datos de una story (títulos de obra, de colección) no
				// es una entrada del catálogo. Se distingue por vivir en el objeto que declara `component`.
				const siblings = node.parent.properties ?? [];
				if (!siblings.some((prop) => prop.type === 'Property' && prop.key?.name === 'component')) return;

				const declared = entryTitle(docsPath);
				if (declared === undefined) {
					context.report({ node, messageId: 'missingEntry', data: { file: docsPath.split('/').pop() } });
					return;
				}
				if (declared !== node.value.value) {
					context.report({
						node,
						messageId: 'titleMismatch',
						data: { meta: JSON.stringify(node.value.value), entry: JSON.stringify(declared) },
					});
				}
			},
		};
	},
};
