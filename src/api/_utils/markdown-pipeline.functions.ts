import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { Markdown } from '@models/markdown.model';
import { createSanitizedHtml, type SanitizedHtml } from '@models/sanitized-html.model';

// Tipado estructural mínimo del hast: alcanza para el walker sin acoplar @types/hast.
interface HtmlNode {
	readonly type: string;
	readonly tagName?: string;
	readonly properties?: Record<string, unknown>;
	readonly children?: readonly HtmlNode[];
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

// Única fuente de verdad del allow-list (docs/LITERARY_WORK_DESIGN.md §9): cambiarla exige
// regen masivo de derivados + tests de XSS. Privada hasta que exista otro consumidor real.
const literaryWorkSanitizationSchema: Options = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		// src/alt/width/height ya están permitidos por el schema por defecto (img + global `*`).
		img: [...(defaultSchema.attributes?.['img'] ?? []), 'srcSet', 'loading', 'decoding'],
	},
};

// Singleton de módulo: construir el procesador unified es costoso y el pipeline es inmutable.
const pipeline = unified()
	.use(remarkParse)
	.use(remarkRehype)
	.use(rehypeSanityImages)
	.use(rehypeSanitize, literaryWorkSanitizationSchema)
	.use(rehypeStringify);

export function markdownToSanitizedHtml(markdown: Markdown): SanitizedHtml {
	return createSanitizedHtml(String(pipeline.processSync(markdown)));
}
