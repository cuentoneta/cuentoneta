import { createSanitizedHtml } from '@models/sanitized-html.model';
import { onoffLiteraryWorksWithEditorialNote } from '@mocks/onoff-literary-works.mock';
import { htmlToPlainText } from './html-to-plain-text.utils';

describe('htmlToPlainText', () => {
	// El HTML de estos casos va declarado acá y no tomado del corpus: lo que se prueba es cómo se
	// reduce cada construcción del marcado, así que el HTML es el sujeto del test, no un accesorio.
	describe('reducción del marcado', () => {
		it('separa con un espacio el texto de dos bloques contiguos', () => {
			const html = createSanitizedHtml('<p>Primer párrafo.</p><p>Segundo párrafo.</p>');

			expect(htmlToPlainText(html)).toBe('Primer párrafo. Segundo párrafo.');
		});

		it('conserva el texto de las marcas inline sin despegar la puntuación', () => {
			const html = createSanitizedHtml('<p>Su novela <em>Geometría</em> y el <strong>ensayo</strong>.</p>');

			expect(htmlToPlainText(html)).toBe('Su novela Geometría y el ensayo.');
		});

		it('separa el texto que un salto de línea divide dentro del mismo bloque', () => {
			const html = createSanitizedHtml('<p>Chateauroux, 1948<br />París, 1994</p>');

			expect(htmlToPlainText(html)).toBe('Chateauroux, 1948 París, 1994');
		});

		it('colapsa los saltos de línea y la sangría del HTML', () => {
			const html = createSanitizedHtml('<p>\n\tUna línea\n\ty otra\n</p>');

			expect(htmlToPlainText(html)).toBe('Una línea y otra');
		});

		it('devuelve cadena vacía ante HTML válido sin texto', () => {
			const html = createSanitizedHtml('<p><img src="https://cdn.sanity.io/foto.jpg" alt="Foto"/></p>');

			expect(htmlToPlainText(html)).toBe('');
		});
	});

	describe('entidades HTML', () => {
		it('decodifica las entidades que emite el pipeline', () => {
			const html = createSanitizedHtml('<p>Ida &amp; vuelta: &lt;pausa&gt;, &quot;dijo&quot; &#39;él&#39;.</p>');

			expect(htmlToPlainText(html)).toBe(`Ida & vuelta: <pausa>, "dijo" 'él'.`);
		});

		it('no decodifica dos veces una entidad escapada', () => {
			const html = createSanitizedHtml('<p>Se escribe &amp;lt; para un menor.</p>');

			expect(htmlToPlainText(html)).toBe('Se escribe &lt; para un menor.');
		});
	});

	describe('sobre el corpus', () => {
		it('reduce las notas editoriales de Onoff a texto sin marcado', () => {
			for (const { editorialNote } of onoffLiteraryWorksWithEditorialNote) {
				expect(editorialNote).toBeDefined();
				if (!editorialNote) {
					continue;
				}

				const plainText = htmlToPlainText(editorialNote);

				expect(plainText).not.toMatch(/[<>]/);
				expect(plainText.trim()).toBe(plainText);
				expect(plainText.length).toBeGreaterThan(0);
			}
		});
	});
});
