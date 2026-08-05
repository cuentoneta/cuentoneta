/**
 * Conversor de Portable Text a Markdown para las migraciones de contenido del CMS.
 *
 * Cubre el subconjunto que el dataset usa realmente —párrafos con énfasis, negrita y enlaces— y
 * **falla ante todo lo demás**. Esa es su regla de diseño: una migración que descarta en silencio una
 * construcción que no supo traducir pierde contenido sin dejar rastro, y el dato original no se
 * recupera. Preferimos que se detenga y que alguien decida.
 *
 * Crece por extensión: cuando una migración futura encuentre una construcción nueva (listas,
 * encabezados, citas), se agrega acá con su caso de prueba, no en la migración que la encontró.
 */

/** Un `markDef` de enlace: lo único que el conversor sabe resolver hoy. */
export interface PortableTextLinkMarkDef {
	_type: 'link';
	_key: string;
	href?: string;
}

export interface PortableTextSpan {
	_type: 'span';
	_key?: string;
	text?: string;
	marks?: string[];
}

export interface PortableTextBlock {
	_type: string;
	_key?: string;
	style?: string;
	listItem?: string;
	markDefs?: { _type: string; _key: string; href?: string }[];
	children?: PortableTextSpan[];
}

/** Se lanza ante cualquier construcción que el conversor no sabe traducir sin perder contenido. */
export class UnsupportedPortableTextError extends Error {
	constructor(
		message: string,
		public readonly blockKey: string | undefined,
	) {
		super(`${message}${blockKey ? ` (bloque "${blockKey}")` : ''}`);
		this.name = 'UnsupportedPortableTextError';
	}
}

// Los caracteres que, sin escapar, Markdown interpretaría como marcado. No se escapa todo el conjunto
// de CommonMark a propósito: sobre-escapar prosa la vuelve ilegible en el CMS, que es donde un editor
// la va a leer y editar después de migrada.
// `<` incluido porque el corpus lo usa como comilla angular (`<<componer>>`) y Markdown lo lee como
// apertura de etiqueta HTML: el saneamiento después la descarta y se lleva el texto de adentro.
const MARKDOWN_SPECIALS = /([\\*_[\]<])/g;

function escapeMarkdown(text: string): string {
	return text.replace(MARKDOWN_SPECIALS, '\\$1');
}

/**
 * Los decoradores de alineación del editor viejo (`blockContent.ts`). Markdown no tiene alineación, y
 * el pipeline de la app descarta el HTML crudo: un `<p align="center">` no pierde el centrado, pierde
 * el texto entero. Se traducen ignorando la marca y conservando el texto — la decisión y las obras
 * afectadas están registradas en el issue de revisión editorial.
 */
const ALIGNMENT_MARKS = new Set(['left', 'center', 'right', 'justify']);

/** Estilos de bloque de Sanity por defecto (el schema no los declara, así que valen los suyos). */
const HEADING_LEVELS: Readonly<Record<string, number>> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

const LIST_MARKERS: Readonly<Record<string, string>> = { bullet: '-', number: '1.' };

/**
 * Un bloque cuyo texto entero es una tirada de asteriscos, guiones o guiones bajos es un **separador
 * de escena**: el corpus los escribe así, centrados, porque el editor viejo no tenía un separador
 * propio. Markdown sí lo tiene, así que se traduce al que corresponde en vez de escapar los
 * caracteres y dejar la tirada como texto literal.
 */
const THEMATIC_BREAK = /^[*\-_]{3,}$/;

function isThematicBreak(block: PortableTextBlock): boolean {
	const text = (block.children ?? [])
		.map((span) => span.text ?? '')
		.join('')
		.trim();
	return THEMATIC_BREAK.test(text);
}

function assertSupported(block: PortableTextBlock): void {
	if (block._type !== 'block') {
		throw new UnsupportedPortableTextError(`Tipo de bloque no soportado: "${block._type}"`, block._key);
	}
	if (
		block.style !== undefined &&
		block.style !== 'normal' &&
		!(block.style in HEADING_LEVELS) &&
		block.style !== 'blockquote'
	) {
		throw new UnsupportedPortableTextError(`Estilo no soportado: "${block.style}"`, block._key);
	}
	if (block.listItem !== undefined && !(block.listItem in LIST_MARKERS)) {
		throw new UnsupportedPortableTextError(`Lista no soportada: "${block.listItem}"`, block._key);
	}
	for (const markDef of block.markDefs ?? []) {
		if (markDef._type !== 'link') {
			throw new UnsupportedPortableTextError(`markDef no soportado: "${markDef._type}"`, block._key);
		}
	}
}

function resolveLinkHref(block: PortableTextBlock, markKey: string): string | undefined {
	return block.markDefs?.find((markDef) => markDef._key === markKey)?.href;
}

/**
 * Un destino de enlace sin delimitar no admite paréntesis sin balancear ni espacios: el primero cierra
 * el destino antes de tiempo y el resto de la URL se derrama como texto visible en la prosa. Pasa en
 * 20 obras del corpus, con URLs que llevan fragmentos `#:~:text=…`. CommonMark resuelve esto con `<>`.
 */
function renderLinkDestination(href: string): string {
	return /[()\s]/.test(href) ? `<${href}>` : href;
}

// El orden de anidado importa: el enlace envuelve al énfasis, no al revés. `[**texto**](url)` es válido;
// `**[texto](url)**` también, pero deja el marcado del enlace adentro del énfasis y se lee peor.
function renderSpan(block: PortableTextBlock, span: PortableTextSpan): string {
	const marks = span.marks ?? [];
	const escaped = escapeMarkdown(span.text ?? '');
	if (escaped.trim() === '') return escaped;

	// El espacio de los bordes queda **fuera** de los delimitadores. Un span marcado cuyo texto termina
	// en espacio es corriente en el dataset, y CommonMark no cierra un énfasis cuyo delimitador viene
	// precedido de espacio: `**Nombre **` se leería literal, perdiendo la negrita en silencio.
	const [, leading, core, trailing] = /^(\s*)([\s\S]*?)(\s*)$/.exec(escaped) ?? ['', '', escaped, ''];
	let rendered = core;

	if (marks.includes('em')) rendered = `*${rendered}*`;
	if (marks.includes('strong')) rendered = `**${rendered}**`;

	for (const mark of marks) {
		if (mark === 'em' || mark === 'strong' || ALIGNMENT_MARKS.has(mark)) continue;

		const href = resolveLinkHref(block, mark);
		if (href === undefined) {
			throw new UnsupportedPortableTextError(`Marca sin markDef de enlace que la resuelva: "${mark}"`, block._key);
		}
		rendered = `[${rendered}](${renderLinkDestination(href)})`;
	}

	return `${leading}${rendered}${trailing}`;
}

/** Antepone el marcado del bloque al texto ya renderizado: encabezado, cita o ítem de lista. */
function prefixFor(block: PortableTextBlock): string {
	if (block.listItem) {
		return `${LIST_MARKERS[block.listItem]} `;
	}
	if (block.style === 'blockquote') {
		return '> ';
	}
	const level = block.style ? HEADING_LEVELS[block.style] : undefined;
	return level ? `${'#'.repeat(level)} ` : '';
}

/**
 * El diálogo en español abre con guion, y una línea que arranca con `- `, `1. ` o `>` es, para
 * Markdown, un ítem de lista o una cita: el marcador desaparece y el texto queda envuelto en otro
 * elemento. Se escapa **por línea** y no solo al principio del bloque, porque el corpus guarda saltos
 * de línea dentro del texto de un mismo span — ahí es donde el marcador vuelve a quedar al inicio.
 *
 * Se escapa solo al inicio de línea, que es donde Markdown le da ese significado: hacerlo en el medio
 * ensuciaría la prosa que alguien va a leer y editar después en el CMS.
 */
function escapeLineStart(line: string): string {
	// En la lista numerada se escapa el signo y no el dígito: CommonMark solo reconoce el escape sobre
	// puntuación ASCII, así que `\1.` dejaría la barra a la vista mientras que `1\.` desarma el marcador.
	return line.replace(/^(\s*)(\d+)([.)])(\s|$)/, '$1$2\\$3$4').replace(/^(\s*)([-+*>])(\s|$)/, '$1\\$2$3');
}

function renderBlock(block: PortableTextBlock): string {
	assertSupported(block);
	if (isThematicBreak(block)) {
		return '---';
	}
	const text = (block.children ?? []).map((span) => renderSpan(block, span)).join('');
	if (text.trim() === '') {
		return text;
	}
	// La primera línea no necesita escape cuando el bloque ya lleva marcador propio: ese prefijo la
	// abre. Las siguientes sí, porque el prefijo no las alcanza.
	const prefix = prefixFor(block);
	const lines = text.split('\n').map((line, index) => (prefix && index === 0 ? line : escapeLineStart(line)));
	return `${prefix}${lines.join('\n')}`;
}

/**
 * Convierte un array de Portable Text a Markdown. Los párrafos se separan con una línea en blanco,
 * que es como Markdown los distingue.
 *
 * Lanza `UnsupportedPortableTextError` ante cualquier construcción fuera del subconjunto soportado.
 */
export function portableTextToMarkdown(blocks: PortableTextBlock[]): string {
	// El descarte va por contenido y no por identidad con la cadena vacía: un bloque cuyos spans son
	// todos espacios rinde whitespace, y colarlo produciría un valor que el dominio rechaza al leerlo.
	const rendered = blocks
		.map((block) => ({ markdown: renderBlock(block), isListItem: block.listItem !== undefined }))
		.filter((entry) => entry.markdown.trim() !== '');

	// Dos ítems consecutivos se unen con un solo salto: separarlos con línea en blanco produce una
	// lista "suelta", que CommonMark envuelve en un párrafo dentro de cada ítem. El resto de los
	// bloques sí van separados por línea en blanco, que es como Markdown distingue párrafos.
	return rendered
		.map((entry, index) => {
			if (index === 0) return entry.markdown;
			const separator = entry.isListItem && rendered[index - 1]?.isListItem ? '\n' : '\n\n';
			return `${separator}${entry.markdown}`;
		})
		.join('');
}
