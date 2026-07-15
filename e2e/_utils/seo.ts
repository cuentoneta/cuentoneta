const JSONLD_PATTERN = /<script[^>]*\bdata-schema-id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g;

export function parseJsonLdBlocks(html: string): Map<string, Record<string, unknown>> {
	const blocks = new Map<string, Record<string, unknown>>();
	for (const match of html.matchAll(JSONLD_PATTERN)) {
		const [, id, json] = match;
		blocks.set(id, JSON.parse(json) as Record<string, unknown>);
	}
	return blocks;
}

export function getMetaContent(html: string, nameOrProperty: string): string | null {
	const key = escapeRegExp(nameOrProperty);
	const byName = html.match(new RegExp(`<meta[^>]+name="${key}"[^>]+content="([^"]*)"`, 'i'));
	if (byName) {
		return byName[1];
	}
	const byProperty = html.match(new RegExp(`<meta[^>]+property="${key}"[^>]+content="([^"]*)"`, 'i'));
	if (byProperty) {
		return byProperty[1];
	}
	const contentFirst = html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:name|property)="${key}"`, 'i'));
	return contentFirst?.[1] ?? null;
}

export function getTitleText(html: string): string | null {
	const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html;
	return head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? null;
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getCanonicalHref(html: string): string | null {
	return (
		html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ??
		html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1] ??
		null
	);
}
