import { parse, type HTMLElement } from 'node-html-parser';

export function parseHtml(html: string): HTMLElement {
	return parse(html);
}

export function parseJsonLdBlocks(html: string): Map<string, Record<string, unknown>> {
	const blocks = new Map<string, Record<string, unknown>>();
	for (const script of parseHtml(html).querySelectorAll('script[data-schema-id]')) {
		const id = script.getAttribute('data-schema-id');
		if (id) {
			blocks.set(id, JSON.parse(script.rawText) as Record<string, unknown>);
		}
	}
	return blocks;
}

export function getMetaContent(html: string, nameOrProperty: string): string | null {
	const key = nameOrProperty.replace(/"/g, '\\"');
	const root = parseHtml(html);
	return (
		root.querySelector(`meta[name="${key}"]`)?.getAttribute('content') ??
		root.querySelector(`meta[property="${key}"]`)?.getAttribute('content') ??
		null
	);
}

export function getTitleText(html: string): string | null {
	return parseHtml(html).querySelector('head title')?.text ?? null;
}

export function getCanonicalHref(html: string): string | null {
	return parseHtml(html).querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
}
