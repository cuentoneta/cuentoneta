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

	it.each([
		['a script tag', '<p>Hola</p><script>alert(1)</script>'],
		['an iframe', '<iframe src="https://example.com"></iframe>'],
		['an inline event handler', '<img src="x" onerror="alert(1)" />'],
		['a javascript: link', '<a href="javascript:alert(1)">Leer</a>'],
	])('throws when the content carries %s', (_case, value) => {
		expect(() => createSanitizedHtml(value)).toThrow(
			'SanitizedHtml inválido: el contenido no pasó por el pipeline de sanitización',
		);
	});

	it.each([
		['prose naming a tag, already escaped', '<p>El módulo declara &lt;script&gt; en su cabecera.</p>'],
		['prose naming a protocol', '<p>Escribió javascript: en la barra de direcciones.</p>'],
		['an image with the attributes the pipeline injects', '<img src="a.png" srcset="a.png 1x" loading="lazy" />'],
		['a link to an external site', '<a href="https://example.com">Leer</a>'],
	])('accepts %s', (_case, value) => {
		expect(createSanitizedHtml(value)).toBe(value);
	});
});
