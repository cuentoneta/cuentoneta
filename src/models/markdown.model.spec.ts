import { createMarkdown } from './markdown.model';

describe('createMarkdown', () => {
	it('returns the value branded as Markdown when it has content', () => {
		expect(createMarkdown('# Título\n\nUn párrafo.')).toBe('# Título\n\nUn párrafo.');
	});

	it('throws on an empty string', () => {
		expect(() => createMarkdown('')).toThrow('Markdown inválido: contenido vacío');
	});

	it('throws on a whitespace-only string', () => {
		expect(() => createMarkdown('  \n\t ')).toThrow('Markdown inválido: contenido vacío');
	});
});
