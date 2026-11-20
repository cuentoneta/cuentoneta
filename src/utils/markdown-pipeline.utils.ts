import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { Markdown } from '@models/markdown.model';
import { LITERARY_WORK_EXCERPT_MAX_LENGTH } from '@models/literary-work-excerpt.model';
import { createSanitizedHtml, type SanitizedHtml } from '@models/sanitized-html.model';
import { wordBoundaryEnd } from '@utils/text-excerpt.utils';

// Tipado estructural mínimo del hast: alcanza para el walker sin acoplar @types/hast.
interface HtmlNode {
	readonly type: string;
	readonly tagName?: string;
	readonly properties?: Record<string, unknown>;
	readonly children?: readonly HtmlNode[];
	readonly value?: string;
}

function visitImages(node: HtmlNode, transform: (properties: Record<string, unknown>) => void): void {
	if (node.type === 'element' && node.tagName === 'img' && node.properties) {
		transform(node.properties);
	}
	node.children?.forEach((child) => visitImages(child, transform));
}

// Reproduce la optimización que ngSrc haría en templates: el cuerpo se pinta por [innerHTML],
// así que las dimensiones (CLS) y los hints de carga se inyectan acá, leyendo el WxH que la
// URL de cdn.sanity.io codifica en el assetId.
function rehypeSanityImages() {
	// Solo URLs del CDN de Sanity: srcSet se construye desde src ANTES de que rehypeSanitize valide
	// protocolos, y srcset no tiene validación de protocolo en el schema — anclar el host cierra ese
	// hueco de defensa en profundidad.
	const sanityImageDimensions = /^https:\/\/cdn\.sanity\.io\/.*-(\d+)x(\d+)\.\w+(?:\?.*)?$/;

	return (tree: HtmlNode) => {
		visitImages(tree, (properties) => {
			if (typeof properties['src'] !== 'string') {
				return;
			}
			const match = properties['src'].match(sanityImageDimensions);
			if (!match) {
				return;
			}
			const [, width, height] = match;
			properties['width'] = Number(width);
			properties['height'] = Number(height);
			properties['srcSet'] = `${properties['src']} ${width}w`;
			properties['loading'] = 'lazy';
			properties['decoding'] = 'async';
		});
	};
}

// Concatenación de los text nodes en orden de documento. Un <br> no aporta nada: el salto de verso ya
// llega como el '\n' del text node que lo sigue.
function plainText(node: HtmlNode): string {
	if (node.type === 'text') {
		return node.value ?? '';
	}
	return (node.children ?? []).map(plainText).join('');
}

// Copia del nodo con solo los primeros `budget.remaining` caracteres de texto; descuenta del presupuesto
// lo que conserva. Devuelve null para todo lo que queda después del corte, y para un elemento que tenía
// texto y se quedó sin él. Un elemento sin hijos, como <img> o <hr>, se conserva si está antes del corte.
function truncateNode(node: HtmlNode, budget: { remaining: number }): HtmlNode | null {
	if (budget.remaining <= 0) {
		return null;
	}
	if (node.type === 'text') {
		const value = (node.value ?? '').slice(0, budget.remaining);
		budget.remaining -= value.length;
		return { ...node, value };
	}
	if (!node.children || node.children.length === 0) {
		return node;
	}
	const children = node.children.map((child) => truncateNode(child, budget)).filter((child) => child !== null);
	return node.type === 'element' && children.length === 0 ? null : { ...node, children };
}

// El `…` va dentro del último texto que quedó, para no sumar un nodo suelto fuera de su párrafo.
function appendEllipsis(node: HtmlNode): HtmlNode {
	if (node.type === 'text') {
		return { ...node, value: `${node.value ?? ''}…` };
	}
	const children = [...(node.children ?? [])];
	const lastWithText = children.map((child) => plainText(child).length > 0).lastIndexOf(true);
	const target = children[lastWithText];
	if (!target) {
		return node;
	}
	children[lastWithText] = appendEllipsis(target);
	return { ...node, children };
}

// Corre después del sanitizador y solo poda nodos o acorta texto, así que no puede sumar nada fuera del
// allow-list. Un árbol que ya cabe sale sin tocar.
function rehypeTruncate(maxLength: number) {
	return (tree: HtmlNode): HtmlNode | undefined => {
		if (maxLength === Infinity) {
			return undefined;
		}
		const text = plainText(tree);
		if (text.length <= maxLength) {
			return undefined;
		}
		const truncated = truncateNode(tree, { remaining: wordBoundaryEnd(text, maxLength) });
		return truncated ? appendEllipsis(truncated) : undefined;
	};
}

// Única fuente de verdad del allow-list (docs/LITERARY_WORK_DESIGN.md §9): cambiarla exige
// actualizar los tests de XSS, y deja stale a la caché de borde hasta que revalide.
// Privada hasta que exista otro consumidor real.
const literaryWorkSanitizationSchema: Options = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		// src/alt/width/height ya están permitidos por el schema por defecto (img + global `*`).
		img: [...(defaultSchema.attributes?.['img'] ?? []), 'srcSet', 'loading', 'decoding'],
	},
};

// Sacar un tag del allow-list no descarta su contenido: el sanitizador desanida el elemento y
// conserva sus hijos, incluido el énfasis que lleve adentro.
const linklessSanitizationSchema: Options = {
	...literaryWorkSanitizationSchema,
	tagNames: (literaryWorkSanitizationSchema.tagNames ?? defaultSchema.tagNames ?? []).filter((tag) => tag !== 'a'),
};

// Singletons de módulo: construir el procesador unified es costoso y el pipeline es inmutable.
function buildPipeline(schema: Options, maxVisibleLength = Infinity) {
	return (
		unified()
			.use(remarkParse)
			// Va antes de remarkRehype: opera sobre mdast. El porqué del salto duro, en
			// docs/LITERARY_WORK_DESIGN.md §9.
			.use(remarkBreaks)
			.use(remarkRehype)
			.use(rehypeSanityImages)
			.use(rehypeSanitize, schema)
			.use(rehypeTruncate, maxVisibleLength)
			.use(rehypeStringify)
	);
}

const pipeline = buildPipeline(literaryWorkSanitizationSchema);
const linklessPipeline = buildPipeline(linklessSanitizationSchema);
const excerptPipeline = buildPipeline(literaryWorkSanitizationSchema, LITERARY_WORK_EXCERPT_MAX_LENGTH);

export function markdownToSanitizedHtml(markdown: Markdown): SanitizedHtml {
	return createSanitizedHtml(String(pipeline.processSync(markdown)));
}

/**
 * Igual que `markdownToSanitizedHtml`, recortado a `LITERARY_WORK_EXCERPT_MAX_LENGTH` caracteres visibles en
 * límite de palabra y terminado en `…`. Un texto que ya cabe sale idéntico a `markdownToSanitizedHtml`.
 * Lo que queda después del corte se descarta entero, imágenes incluidas.
 */
export function markdownToExcerptHtml(markdown: Markdown): SanitizedHtml {
	return createSanitizedHtml(String(excerptPipeline.processSync(markdown)));
}

/**
 * Igual que `markdownToSanitizedHtml`, pero el resultado no lleva enlaces: el texto del enlace
 * sobrevive, la navegación no. Para la prosa que se pinta **dentro** de algo que ya es un destino,
 * como la tarjeta de un listado, donde un enlace propio anidaría anclas —marcación inválida— y
 * competiría con el destino de la tarjeta.
 */
export function markdownToLinklessSanitizedHtml(markdown: Markdown): SanitizedHtml {
	return createSanitizedHtml(String(linklessPipeline.processSync(markdown)));
}
