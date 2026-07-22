import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';
import type { Markdown } from '@models/markdown.model';
import { createSanitizedHtml, type SanitizedHtml } from '@models/sanitized-html.model';

// Única fuente de verdad del allow-list — la materialización de derivados la reutiliza
// (docs/LITERARY_WORK_DESIGN.md §9). Cambiarla exige regen masivo + tests de XSS.
export const literaryWorkSanitizationSchema: Options = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		// src/alt/width/height ya están permitidos por el schema por defecto (img + global `*`).
		img: [...(defaultSchema.attributes?.['img'] ?? []), 'srcSet', 'loading', 'decoding'],
	},
};

// Solo URLs del CDN de Sanity: srcSet se construye desde src ANTES de que rehypeSanitize valide
// protocolos, y srcset no tiene validación de protocolo en el schema — anclar el host cierra ese
// hueco de defensa en profundidad.
const SANITY_IMAGE_DIMENSIONS = /^https:\/\/cdn\.sanity\.io\/.*-(\d+)x(\d+)\.\w+(?:\?.*)?$/;

// Reproduce la optimización que ngSrc haría en templates: el cuerpo se pinta por [innerHTML],
// así que las dimensiones (CLS) y los hints de carga se inyectan acá, leyendo el WxH que la
// URL de cdn.sanity.io codifica en el assetId.
function rehypeSanityImages() {
	return (tree: Root) => {
		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'img' || typeof node.properties['src'] !== 'string') {
				return;
			}
			const match = node.properties['src'].match(SANITY_IMAGE_DIMENSIONS);
			if (!match) {
				return;
			}
			const [, width, height] = match;
			node.properties['width'] = Number(width);
			node.properties['height'] = Number(height);
			node.properties['srcSet'] = `${node.properties['src']} ${width}w`;
			node.properties['loading'] = 'lazy';
			node.properties['decoding'] = 'async';
		});
	};
}

const pipeline = unified()
	.use(remarkParse)
	.use(remarkRehype)
	.use(rehypeSanityImages)
	.use(rehypeSanitize, literaryWorkSanitizationSchema)
	.use(rehypeStringify);

export function markdownToSanitizedHtml(markdown: Markdown): SanitizedHtml {
	return createSanitizedHtml(String(pipeline.processSync(markdown)));
}
