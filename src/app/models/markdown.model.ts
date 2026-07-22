export type Markdown = string & { readonly __brand: 'Markdown' };

export function createMarkdown(value: string): Markdown {
	if (value.trim() === '') {
		throw new Error('Markdown inválido: contenido vacío');
	}
	return value as Markdown;
}
