import { createMarkdown } from '@models/markdown.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { onoffLiteraryWorksWithEditorialNote } from '@mocks/onoff-literary-works.mock';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
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

	// Estos casos parten del Markdown y no de HTML autorado a mano: la forma exacta de las referencias
	// la decide el pipeline, y una aserción sobre HTML escrito acá no detectaría que dejó de coincidir.
	describe('referencias de caracteres, desde el pipeline real', () => {
		const fromMarkdown = (markdown: string) => htmlToPlainText(markdownToSanitizedHtml(createMarkdown(markdown)));

		it('decodifica el ampersand', () => {
			expect(fromMarkdown('Ida & vuelta')).toBe('Ida & vuelta');
		});

		it('decodifica los signos de menor y mayor', () => {
			expect(fromMarkdown('Entre \\< y \\> hay una pausa')).toBe('Entre < y > hay una pausa');
		});

		it('no deja ninguna referencia sin resolver', () => {
			expect(fromMarkdown('Ida & vuelta: \\<pausa\\>, "dijo" y punto.')).not.toMatch(/&#|&[a-z]+;/i);
		});
	});

	describe('referencias de caracteres, por forma', () => {
		it('decodifica las referencias con nombre', () => {
			const html = createSanitizedHtml('<p>Ida &amp; vuelta: &lt;pausa&gt;, &quot;dijo&quot; &apos;él&apos;.</p>');

			expect(htmlToPlainText(html)).toBe(`Ida & vuelta: <pausa>, "dijo" 'él'.`);
		});

		it('decodifica las referencias numéricas, decimales y hexadecimales', () => {
			const html = createSanitizedHtml('<p>Ida &#x26; vuelta &#38; regreso: &#x3C;pausa&#x3E;</p>');

			expect(htmlToPlainText(html)).toBe('Ida & vuelta & regreso: <pausa>');
		});

		it('no decodifica dos veces una referencia escapada', () => {
			const html = createSanitizedHtml('<p>Se escribe &amp;lt; y &#x26;#x3C; para un menor.</p>');

			expect(htmlToPlainText(html)).toBe('Se escribe &lt; y &#x3C; para un menor.');
		});
	});

	describe('límites conocidos', () => {
		// El barrido de tags corta en el primer `>`, aunque venga dentro de un valor de atributo. El
		// pipeline no emite un `>` sin escapar ahí, así que la limitación queda enunciada, no manejada.
		it('trunca un tag cuyo atributo contiene un signo mayor sin escapar', () => {
			const html = createSanitizedHtml('<p><img alt="a > b"/>Texto</p>');

			expect(htmlToPlainText(html)).toBe('b"/>Texto');
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
