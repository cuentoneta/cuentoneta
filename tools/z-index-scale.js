/**
 * La escala de apilamiento del Design System, leída del `@theme` de `src/tailwind.css`.
 *
 * Existe para que la escala esté declarada en un solo lugar de verdad: las reglas de ESLint y de
 * Stylelint que la hacen cumplir preguntan acá en vez de repetir la lista de nombres, así que renombrar
 * o renumerar un token en el tema alcanza para mover las dos reglas con él.
 *
 * Tailwind no puede hacer este trabajo: su utilidad `z` resuelve cualquier número sin consultar el tema,
 * de modo que `z-10` compila con o sin escala declarada. Un nombre inexistente, en cambio, no emite CSS
 * alguno y tampoco falla el build — ese silencio es lo que las reglas convierten en error.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// El archivo se ubica relativo a este módulo cuando corre en Node (las dos reglas de lint), y relativo al
// directorio del workspace cuando lo transforma Vite: ahí `import.meta.dirname` no existe, porque el
// módulo no se carga desde el sistema de archivos.
const THEME_FILE = import.meta.dirname
	? resolve(import.meta.dirname, '../src/tailwind.css')
	: resolve(process.cwd(), 'src/tailwind.css');
const TOKEN_DECLARATION = /--z-index-([a-z][a-z0-9-]*)\s*:\s*([^;]+);/g;

// Los nombres que Tailwind reconoce sin que la escala los declare. `z-auto` es la utilidad nativa; el
// resto son palabras clave válidas en una declaración `z-index` de CSS.
const NATIVE_UTILITIES = new Set(['auto']);
const CSS_WIDE_KEYWORDS = new Set(['auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer']);

// Las capas globales viven a nivel de aplicación y se usan sin aislar. Se distinguen por nombre y no por
// valor: cuál es global es una decisión de diseño, no una consecuencia de ser el número más alto.
const GLOBAL_LAYERS = new Set(['nav', 'floating']);

let cachedScale;

function parseScale(css) {
	const scale = new Map();
	for (const [, token, value] of css.matchAll(TOKEN_DECLARATION)) {
		scale.set(token, Number(value.trim()));
	}
	return scale;
}

/**
 * La escala como `Map<token, valor>`. Lee el tema una sola vez por proceso — una regla de lint corre
 * sobre cientos de archivos y el tema no cambia en el medio.
 *
 * Lanza si el tema no declara ningún token: sin eso, una escala vacía volvería permisivas a las dos
 * reglas en silencio, que es el peor resultado posible para un mecanismo cuya razón de ser es avisar.
 */
export function zIndexScale() {
	if (!cachedScale) {
		cachedScale = parseScale(readFileSync(THEME_FILE, 'utf-8'));
		if (cachedScale.size === 0) {
			cachedScale = undefined;
			throw new Error(`No se encontró ningún token --z-index-* en ${THEME_FILE}: la escala de apilamiento está vacía.`);
		}
	}
	return cachedScale;
}

/** Los nombres de capa declarados, en el orden del tema. Para armar el mensaje de error de las reglas. */
export function scaleTokens() {
	return [...zIndexScale().keys()];
}

/** Los nombres de las capas globales que la escala declara. */
export function globalTokens() {
	return scaleTokens().filter((token) => GLOBAL_LAYERS.has(token));
}

/** ¿`z-<suffix>` es una utilidad admitida — un token de la escala o la nativa `z-auto`? */
export function isAllowedUtility(suffix) {
	return NATIVE_UTILITIES.has(suffix) || zIndexScale().has(suffix);
}

/** ¿`z-<suffix>` nombra una capa global (la franja reservada a barra y capa flotante)? */
export function isGlobalUtility(suffix) {
	return GLOBAL_LAYERS.has(suffix) && zIndexScale().has(suffix);
}

/**
 * ¿El valor de una declaración `z-index` es admitido? Solo lo son una palabra clave de CSS y un
 * `var(--z-index-<token>)` cuyo token exista en la escala. Un número crudo nunca lo es.
 */
export function isAllowedDeclarationValue(value) {
	const normalized = value.trim();
	if (CSS_WIDE_KEYWORDS.has(normalized.toLowerCase())) {
		return true;
	}
	const reference = normalized.match(/^var\(\s*--z-index-([a-z][a-z0-9-]*)\s*\)$/);
	return reference !== null && zIndexScale().has(reference[1]);
}
