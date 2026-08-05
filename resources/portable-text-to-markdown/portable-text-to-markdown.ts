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
const MARKDOWN_SPECIALS = /([\\*_[\]])/g;

function escapeMarkdown(text: string): string {
	return text.replace(MARKDOWN_SPECIALS, '\\$1');
}

function assertSupported(block: PortableTextBlock): void {
	if (block._type !== 'block') {
		throw new UnsupportedPortableTextError(`Tipo de bloque no soportado: "${block._type}"`, block._key);
	}
	if (block.style !== undefined && block.style !== 'normal') {
		throw new UnsupportedPortableTextError(`Estilo no soportado: "${block.style}"`, block._key);
	}
	if (block.listItem !== undefined) {
		throw new UnsupportedPortableTextError(`Listas no soportadas: "${block.listItem}"`, block._key);
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
		if (mark === 'em' || mark === 'strong') continue;

		const href = resolveLinkHref(block, mark);
		if (href === undefined) {
			throw new UnsupportedPortableTextError(`Marca sin markDef de enlace que la resuelva: "${mark}"`, block._key);
		}
		rendered = `[${rendered}](${href})`;
	}

	return `${leading}${rendered}${trailing}`;
}

function renderBlock(block: PortableTextBlock): string {
	assertSupported(block);
	return (block.children ?? []).map((span) => renderSpan(block, span)).join('');
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
	return blocks
		.map(renderBlock)
		.filter((paragraph) => paragraph.trim() !== '')
		.join('\n\n');
}
