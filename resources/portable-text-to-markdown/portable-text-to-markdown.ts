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
	/** Nivel de anidamiento del ítem de lista, base 1. Es donde Sanity guarda la jerarquía. */
	level?: number;
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
// El backtick abre un span de código, que además se traga el marcado de adentro.
const MARKDOWN_SPECIALS = /([\\*_[\]<`])/g;

// Un `&` solo inicia una entidad cuando lo sigue un nombre o un numeral y un punto y coma. Escaparlo
// siempre ensuciaría cada "Tom & Jerry" del corpus; escaparlo nunca decodifica el `&copy;` literal que
// alguien escribió como texto.
const HTML_ENTITY_START = /&(?=[a-zA-Z][a-zA-Z0-9]{1,31};|#\d{1,7};|#[xX][0-9a-fA-F]{1,6};)/g;

function escapeMarkdown(text: string): string {
	return text.replace(MARKDOWN_SPECIALS, '\\$1').replace(HTML_ENTITY_START, '\\&');
}

/** Estilos de bloque de Sanity por defecto (el schema no los declara, así que valen los suyos). */
const HEADING_LEVELS: Readonly<Record<string, number>> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

const LIST_MARKERS: Readonly<Record<string, string>> = { bullet: '-', number: '1.' };

/**
 * Un bloque cuyo texto entero es una tirada de asteriscos, guiones o guiones bajos es un **separador
 * de escena**: el corpus los escribe así, centrados, porque el editor viejo no tenía un separador
 * propio. Markdown sí lo tiene, así que se traduce al que corresponde en vez de escapar los
 * caracteres y dejar la tirada como texto literal.
 *
 * Solo aplica al bloque sin marcador propio: una cita o un ítem de lista cuyo texto fuera `***`
 * perdería su marcador al traducirse como separador.
 */
function isThematicBreak(block: PortableTextBlock): boolean {
	// La tirada no admite mezclas: CommonMark pide el mismo carácter repetido, y un `-_-` es prosa.
	const thematicBreak = /^(\*{3,}|-{3,}|_{3,})$/;
	if (block.listItem !== undefined || (block.style !== undefined && block.style !== 'normal')) {
		return false;
	}
	const text = (block.children ?? [])
		.map((span) => span.text ?? '')
		.join('')
		.trim();
	return thematicBreak.test(text);
}

function assertSupportedStyle(block: PortableTextBlock): void {
	if (
		block.style !== undefined &&
		block.style !== 'normal' &&
		!(block.style in HEADING_LEVELS) &&
		block.style !== 'blockquote'
	) {
		throw new UnsupportedPortableTextError(`Estilo no soportado: "${block.style}"`, block._key);
	}
}

function assertSupportedList(block: PortableTextBlock): void {
	if (block.listItem !== undefined && !(block.listItem in LIST_MARKERS)) {
		throw new UnsupportedPortableTextError(`Lista no soportada: "${block.listItem}"`, block._key);
	}
}

function assertSupportedMarkDefs(block: PortableTextBlock): void {
	for (const markDef of block.markDefs ?? []) {
		if (markDef._type !== 'link') {
			throw new UnsupportedPortableTextError(`markDef no soportado: "${markDef._type}"`, block._key);
		}
	}
}

function assertSupported(block: PortableTextBlock): void {
	if (block._type !== 'block') {
		throw new UnsupportedPortableTextError(`Tipo de bloque no soportado: "${block._type}"`, block._key);
	}
	assertSupportedStyle(block);
	assertSupportedList(block);
	assertSupportedMarkDefs(block);
}

/**
 * El destino de un enlace no se escapa —no es prosa—, así que lo que no sabemos emitir sin romperlo
 * detiene la corrida. `<` y `>` desbaratan la forma delimitada de CommonMark, y un esquema fuera de la
 * allowlist termina descartado por el saneamiento del pipeline: el enlace se perdería igual, pero en
 * silencio y recién en la página. Sin esquema es un destino relativo, que es válido.
 */
function assertRenderableHref(href: string, blockKey: string | undefined): void {
	const allowedSchemes = new Set(['http', 'https', 'mailto']);
	const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(href)?.[1].toLowerCase();

	if (scheme !== undefined && !allowedSchemes.has(scheme)) {
		throw new UnsupportedPortableTextError(`Esquema de enlace no soportado: "${scheme}"`, blockKey);
	}
	if (/[<>]/.test(href)) {
		throw new UnsupportedPortableTextError('El destino de un enlace no puede contener "<" ni ">"', blockKey);
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
function renderLinkDestination(href: string, blockKey: string | undefined): string {
	assertRenderableHref(href, blockKey);
	return /[()\s]/.test(href) ? `<${href}>` : href;
}

/**
 * Las marcas que **no** producen un envoltorio de enlace. Vive a nivel de módulo pese a tener un solo
 * consumidor: adentro de la función se re-alocaría por cada span del corpus.
 *
 * El énfasis ya se aplicó antes del recorrido; las cuatro de alineación son decoradores del editor
 * viejo (`blockContent.ts`) que se traducen
 * ignorando la marca y conservando el texto. Markdown no tiene alineación, y el pipeline de la app
 * descarta el HTML crudo: un `<p align="center">` no pierde el centrado, pierde el texto entero. La
 * decisión y las obras afectadas están registradas en el issue de revisión editorial.
 */
const NON_LINK_MARKS: ReadonlySet<string> = new Set(['em', 'strong', 'left', 'center', 'right', 'justify']);

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
		if (NON_LINK_MARKS.has(mark)) continue;
		rendered = wrapWithLink(block, mark, rendered);
	}

	return `${leading}${rendered}${trailing}`;
}

/**
 * Envuelve el texto ya renderizado en el enlace que resuelve `mark`. Toda marca que llega acá debería
 * ser un enlace: las de énfasis y las de alineación ya se filtraron.
 */
function wrapWithLink(block: PortableTextBlock, mark: string, rendered: string): string {
	// `code` está declarado en el schema pero no se traduce: un span de código no admite el texto ya
	// escapado que llega hasta acá, y el corpus no lo usa. Se nombra aparte para que el día que
	// aparezca el error diga qué pasó, en vez de acusar un markDef de enlace faltante.
	if (mark === 'code') {
		throw new UnsupportedPortableTextError('Decorador "code" no soportado', block._key);
	}

	const href = resolveLinkHref(block, mark);
	if (href === undefined) {
		throw new UnsupportedPortableTextError(`Marca sin markDef de enlace que la resuelva: "${mark}"`, block._key);
	}
	return `[${rendered}](${renderLinkDestination(href, block._key)})`;
}

/** Antepone el marcado del bloque al texto ya renderizado: encabezado, cita o ítem de lista. */
function prefixFor(block: PortableTextBlock): string {
	if (block.listItem) {
		// Sanity guarda la jerarquía en `level` (base 1) y no en la sangría del texto. Sin trasladarla, una
		// lista de dos niveles se aplana y la jerarquía se pierde sin dejar rastro.
		const indent = '  '.repeat(Math.max(0, (block.level ?? 1) - 1));
		return `${indent}${LIST_MARKERS[block.listItem]} `;
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
	return line
		.replace(/^(\s*)(\d+)([.)])(\s|$)/, '$1$2\\$3$4')
		.replace(/^(\s*)([-+*>])(\s|$)/, '$1\\$2$3')
		.replace(/^(\s*)(#{1,6})(\s|$)/, '$1\\$2$3')
		.replace(/^(\s*)(~{3,})/, '$1\\$2');
}

/**
 * Una tirada de `-` o `=` en línea propia, debajo de una línea con texto, es un **subrayado setext**:
 * Markdown convierte la prosa de arriba en encabezado y se come la tirada entera. Solo pasa en ese
 * caso; con una línea en blanco de por medio la misma tirada es un separador temático legítimo, que se
 * traduce solo. Se escapa entonces únicamente el caso ambiguo, para no perder el separador real.
 */
function escapeSetextUnderline(line: string): string {
	return /^\s*(-+|=+)\s*$/.test(line) ? line.replace(/[-=]/, '\\$&') : line;
}

/**
 * Cuatro espacios —o un tabulador— al abrir un bloque abren un **bloque de código**: la prosa sale
 * monoespaciada dentro de un `<pre>`. La sangría no se puede escapar, porque no es puntuación; se quita,
 * que es presentación del editor viejo y Markdown no la conserva de ninguna manera.
 */
function stripCodeIndent(line: string): string {
	return line.replace(/^(?: {4,}|\t+)/, '');
}

function renderLine(line: string, previous: string | undefined, hasPrefix: boolean): string {
	const opensBlock = previous === undefined || previous.trim() === '';
	const withoutIndent = opensBlock ? stripCodeIndent(line) : line;

	if (!opensBlock) {
		return escapeLineStart(escapeSetextUnderline(withoutIndent));
	}
	// La primera línea no necesita escape cuando el bloque ya lleva marcador propio: ese prefijo la abre.
	return hasPrefix ? withoutIndent : escapeLineStart(withoutIndent);
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
	// El escape es **por línea** y con contexto de la anterior: el corpus guarda saltos de línea dentro
	// del texto de un mismo span, así que un marcador de bloque vuelve a quedar al inicio ahí adentro, y
	// qué significa cada línea depende de si abre bloque o continúa el anterior.
	const prefix = prefixFor(block);
	const source = text.split('\n');
	const lines = source.map((line, index) =>
		renderLine(line, index === 0 ? undefined : source[index - 1], prefix !== '' && index === 0),
	);
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
