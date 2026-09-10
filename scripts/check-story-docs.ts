/**
 * Valida las referencias de la prosa de autodocs de las stories de `src/app/**`.
 *
 * La descripción de `parameters.docs.description` puede nombrar un componente que ya no existe,
 * o enlazar un `kind-id` que no resuelve a ninguna story, sin que ningún gate lo note:
 * `storybook:build` compila las stories sin ejecutar su prosa, así que ni un nombre colgado en
 * `<strong>`/`<code>` ni un `path=/docs/…` roto producen señal en CI. Un barrido manual encontró
 * una referencia así entre el borrado de un componente y su corrección a mano; este check lo deja
 * instalado para que la próxima no dependa de que alguien la note.
 *
 * Dos cruces, ambos baratos, deterministas y sin red:
 *
 * 1. Los nombres en `<strong>` y `<code>` de la descripción del componente (`description.component`)
 *    contra las clases, interfaces, tipos y enums declarados en `src/`. La prosa omite los sufijos
 *    (`CollectionCover` por `CollectionCoverComponent`), y las páginas se exportan con
 *    `export default class`, así que el cruce tolera ambas formas. Un nombre puede ser legítimamente
 *    un modelo o un tipo, no un componente, por eso el conjunto incluye interfaces y tipos.
 * 2. Los `kind-id` de cada `path=/docs/<kind-id>--docs` (en la descripción del componente y en las
 *    de cada story, donde también hay enlaces) contra los `title` de los `meta`, con la misma
 *    normalización que aplica Storybook para resolverlos.
 *
 * El alcance de nombres es solo la descripción del componente a propósito: las descripciones de
 * cada story nombran etiquetas de UI en prosa ("Usos:", nombres de obra, variantes de showcase)
 * que no son referencias a código y validarlas sería ruido. Los enlaces, en cambio, deben resolver
 * estén donde estén, así que esos se revisan en todo el archivo.
 *
 * Queda fuera del alcance lo que no está como literal inline en el archivo (prosa importada de
 * otro módulo o construida dinámicamente): eso no se ve y no se marca.
 *
 * Lo consume el runner `check-claude-docs.ts` (gate de CI `check-agents`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

// Sufijos que la prosa omite al nombrar un símbolo declarado.
const NAME_SUFFIXES = ['Component', 'Directive', 'Service', 'Pipe', 'Page'] as const;

// Patrones compartidos del escaneo. Reusar un `RegExp` con flag `g` entre `matchAll` es seguro:
// cada llamada itera desde el inicio sin arrastrar estado de la anterior.
const COMPONENT_PROSE_RE = /(?<![\w$])component:\s*(?:`([\s\S]*?)`|"([^"]+)"|'([^']+)')/g;
const KIND_ID_RE = /path=\/docs\/([^"'?\s]+?)--docs/g;
const META_TITLE_RE = /(?<![\w$])title:\s*['"]([^'"]+)['"]/g;
const DECLARATION_RE = /export\s+(?:default\s+)?(?:abstract\s+)?(?:class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;
const TAG_PATTERNS = [/<strong>([^<]+)<\/strong>/g, /<code>([^<]+)<\/code>/g] as const;

/**
 * Nombres en PascalCase que la prosa usa legítimamente sin ser clases del repo.
 *
 * Cada entrada explica su uso para que agregar una sea una decisión visible: si una prosa nueva
 * necesita un nombre en PascalCase que no es una clase, se suma acá con su motivo en vez de
 * pasar silenciosamente.
 */
export const STORY_DOC_PROSE_ALLOWLIST: Readonly<Record<string, string>> = Object.freeze({
	Enter: 'Tecla del contrato de teclado nativo del botón, descrita en la prosa del grupo.',
	Espacio: 'Tecla del mismo contrato, nombrada en español en la misma prosa.',
	Filled: 'Nombre visible de la variante de etiqueta, que en código viaja en minúsculas.',
	Highlighted: 'Nombre visible de la variante destacada de la tarjeta de obra.',
	IntersectionObserver: 'API de plataforma para medir visibilidad real, no una clase del repo.',
	OnGray: 'Nombre visible de la variante sobre fondo gris de las tarjetas y selectores.',
	OnWhite: 'Nombre visible de la variante sobre fondo blanco.',
	Outline: 'Nombre visible de la variante de botón, que en código viaja en minúsculas.',
	Páginas: 'Sección del catálogo donde viven las entradas de página, no una clase.',
	ResizeObserver: 'API de plataforma para medir recortes reales, no una clase del repo.',
	Tab: 'Tecla del mismo contrato de teclado nativo.',
});

/**
 * Normalización que Storybook aplica a un `title` para resolver un `kind-id`.
 *
 * Copia exacta de su `sanitize`: baja a minúsculas y sustituye espacios, `/` y puntuación por
 * guiones, colapsando y recortando. No transcribe diacríticos, así que una sección acentuada
 * conserva su tilde en el `kind-id`.
 */
export function sanitizeStorybookTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-')
		.replace(/-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

/** Un nombre candidato a referencia de código: empieza en mayúscula y sigue en letras o dígitos. */
function isCandidateName(raw: string): boolean {
	return /^\p{Lu}[\p{L}\p{N}_]+$/u.test(raw);
}

/**
 * Núcleo puro: si `name` resuelve a un símbolo declarado, exacto o con uno de los sufijos que la
 * prosa omite. Separado para ejercitar el cruce sin leer el disco.
 */
export function isDeclaredName(name: string, declared: ReadonlySet<string>): boolean {
	return (
		declared.has(name) ||
		Object.hasOwn(STORY_DOC_PROSE_ALLOWLIST, name) ||
		NAME_SUFFIXES.some((suffix) => declared.has(`${name}${suffix}`))
	);
}

/** El encabezado del `meta`: todo lo anterior a su `export default`, donde vive su `title`. */
function metaHead(content: string): string {
	const marker = content.indexOf('export default');
	return marker < 0 ? content : content.slice(0, marker);
}

/**
 * Núcleo puro: los `title` del `meta` en el contenido dado.
 *
 * Solo mira el encabezado porque los datos de cada story también usan la clave `title` (títulos
 * de colección, de tarjetas) y esos no son entradas del catálogo: normalizarlos sumaría `kind-id`
 * fantasma que enmascararían un enlace roto.
 */
export function extractMetaTitles(content: string): string[] {
	return [...metaHead(content).matchAll(META_TITLE_RE)].map((match) => match[1]);
}

/** Los offsets de inicio de cada línea: índice ordenado para resolver líneas por posición. */
function lineStarts(content: string): readonly number[] {
	const starts = [0];
	for (let cursor = content.indexOf('\n'); cursor !== -1; cursor = content.indexOf('\n', cursor + 1)) {
		starts.push(cursor + 1);
	}
	return starts;
}

/** La línea 1-indexada del offset dado, por búsqueda binaria sobre los inicios de línea. */
function lineOfStarts(starts: readonly number[], offset: number): number {
	let low = 0;
	let high = starts.length;
	while (low + 1 < high) {
		const mid = (low + high) >> 1;
		const probe: number = starts[mid];
		const takeLow = probe <= offset;
		low = takeLow ? mid : low;
		high = takeLow ? high : mid;
	}
	return low + 1;
}

/** Las menciones colgadas dentro de un bloque de prosa de `component:`, con su línea. */
function danglingNamesInBlob(
	relPath: string,
	starts: readonly number[],
	base: number,
	blob: string,
	declared: ReadonlySet<string>,
): string[] {
	return TAG_PATTERNS.flatMap((pattern) =>
		[...blob.matchAll(pattern)]
			.map((match) => ({ raw: match[1].trim(), at: base + (match.index ?? 0) }))
			.filter((hit) => isCandidateName(hit.raw) && !isDeclaredName(hit.raw, declared))
			.map(
				(hit) =>
					`✗ ${relPath}:${lineOfStarts(starts, hit.at)} — \`${hit.raw}\` no resuelve a ninguna clase, interfaz, tipo o enum de \`src/\`. ` +
					`Si es un símbolo nuevo, revisá su nombre; si es prosa legítima en PascalCase, sumalo a ` +
					`STORY_DOC_PROSE_ALLOWLIST (scripts/check-story-docs.ts) con su motivo.`,
			),
	);
}

/**
 * Núcleo puro: una línea `✗ …` por cada nombre de la descripción del componente que no resuelve
 * a un símbolo declarado; vacío si está todo bien.
 */
export function findDanglingNames(relPath: string, fileContent: string, declared: ReadonlySet<string>): string[] {
	const starts = lineStarts(fileContent);
	return [...fileContent.matchAll(COMPONENT_PROSE_RE)].flatMap((block) => {
		const blob = block[1] ?? block[2] ?? block[3] ?? '';
		return blob === '' ? [] : danglingNamesInBlob(relPath, starts, block.index ?? 0, blob, declared);
	});
}

/**
 * Núcleo puro: una línea `✗ …` por cada `kind-id` enlazado que no resuelve a ningún `title`
 * normalizado; vacío si está todo bien.
 */
export function findDanglingKindIds(relPath: string, fileContent: string, knownIds: ReadonlySet<string>): string[] {
	const starts = lineStarts(fileContent);
	return [...fileContent.matchAll(KIND_ID_RE)]
		.filter((match) => !knownIds.has(match[1]))
		.map(
			(match) =>
				`✗ ${relPath}:${lineOfStarts(starts, match.index ?? 0)} — \`path=/docs/${match[1]}--docs\` no resuelve a ningún \`title\` de story. ` +
				`Revisá la ortografía del enlace con la misma normalización de Storybook (minúsculas, ` +
				`espacios y puntuación a guiones, sin transcribir diacríticos).`,
		);
}

const SKIP = new Set(['node_modules', '.git', 'dist', '.nx', 'coverage']);

function walkFiles(dir: string, accept: (name: string) => boolean): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (SKIP.has(entry.name) || entry.isSymbolicLink()) return [];
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return walkFiles(path, accept);
		return accept(entry.name) ? [path] : [];
	});
}

/** Los `*.stories.ts` bajo `src/app/`, ordenados para que el reporte sea determinista. */
function listStoryFiles(root: string): string[] {
	return walkFiles(join(root, 'src', 'app'), (name) => name.endsWith('.stories.ts')).sort();
}

/**
 * Las clases, interfaces, tipos y enums exportados en `src/`.
 *
 * Las stories y los specs quedan afuera a propósito: sus exports (`Primary`, `Filled`, dobles de
 * test) son nombres del catálogo o de la suite, no símbolos que la prosa pueda referenciar.
 */
function collectDeclaredNames(root: string): Set<string> {
	const declared = new Set<string>();
	const sources = walkFiles(join(root, 'src'), (name) => name.endsWith('.ts')).filter(
		(path) => !path.endsWith('.stories.ts') && !path.endsWith('.spec.ts'),
	);
	for (const path of sources) {
		const content = readFileSync(path, 'utf8');
		for (const match of content.matchAll(DECLARATION_RE)) {
			declared.add(match[1]);
		}
	}
	return declared;
}

/** Los `kind-id` que resuelven hoy: cada `title` de `meta` normalizado como lo hace Storybook. */
function collectKnownKindIds(storyFiles: readonly string[]): Set<string> {
	const known = new Set<string>();
	for (const path of storyFiles) {
		for (const title of extractMetaTitles(readFileSync(path, 'utf8'))) {
			known.add(sanitizeStorybookTitle(title));
		}
	}
	return known;
}

/** Devuelve una línea `✗ …` por cada nombre colgado o enlace roto; vacío si está todo bien. */
export function checkStoryDocs(): string[] {
	const storyFiles = listStoryFiles(ROOT);
	const declared = collectDeclaredNames(ROOT);
	const knownIds = collectKnownKindIds(storyFiles);
	return storyFiles.flatMap((file) => {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		const content = readFileSync(file, 'utf8');
		return [...findDanglingNames(rel, content, declared), ...findDanglingKindIds(rel, content, knownIds)];
	});
}
