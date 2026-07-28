import { createSanitizedHtml } from './sanitized-html.model';

describe('createSanitizedHtml', () => {
	it('returns the value branded as SanitizedHtml when it has content', () => {
		expect(createSanitizedHtml('<p>Un párrafo.</p>')).toBe('<p>Un párrafo.</p>');
	});

	it('throws on an empty string', () => {
		expect(() => createSanitizedHtml('')).toThrow('SanitizedHtml inválido: contenido vacío');
	});

	it('throws on a whitespace-only string', () => {
		expect(() => createSanitizedHtml('   ')).toThrow('SanitizedHtml inválido: contenido vacío');
	});
});
