import { createMarkdown } from '@models/markdown.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import { htmlToPlainText } from './html-to-text.utils';

describe('htmlToPlainText', () => {
	it('should join the text of each block with a space', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Primera **oración**.\n\nSegunda _oración_.'));

		expect(htmlToPlainText(html)).toBe('Primera oración. Segunda oración.');
	});

	it('should keep the text of inline marks without detaching punctuation', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Su novela _Geometría_ y el **ensayo**.'));

		expect(htmlToPlainText(html)).toBe('Su novela Geometría y el ensayo.');
	});

	it('should separate text split by a line break inside the same block', () => {
		const html = createSanitizedHtml('<p>Chateauroux, 1948<br />París, 1994</p>');

		expect(htmlToPlainText(html)).toBe('Chateauroux, 1948 París, 1994');
	});

	it('should collapse an empty block without adding spaces or artifacts', () => {
		const html = createSanitizedHtml('<p></p><p>Biografía sin bloque vacío previo.</p>');

		expect(htmlToPlainText(html)).toBe('Biografía sin bloque vacío previo.');
	});

	// El HTML de estos casos parte del Markdown y no está autorado a mano: la forma exacta de las
	// referencias de caracteres la decide el pipeline, y una aserción sobre HTML escrito acá no
	// detectaría que dejó de coincidir.
	it('should decode the references the pipeline emits', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Ida & vuelta'));

		expect(htmlToPlainText(html)).toBe('Ida & vuelta');
	});

	it('should leave no unresolved reference in the text', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Ida & vuelta: \\<pausa\\>, "dijo" y punto.'));

		expect(htmlToPlainText(html)).not.toMatch(/&#|&[a-z]+;/i);
	});

	it('should decode named and numeric references alike', () => {
		const html = createSanitizedHtml('<p>Ida &amp; vuelta &#38; regreso: &#x3C;pausa&gt;</p>');

		expect(htmlToPlainText(html)).toBe('Ida & vuelta & regreso: <pausa>');
	});

	it('should not decode an escaped reference twice', () => {
		const html = createSanitizedHtml('<p>Se escribe &amp;lt; para un menor.</p>');

		expect(htmlToPlainText(html)).toBe('Se escribe &lt; para un menor.');
	});

	it('should return an empty string when the HTML carries no prose', () => {
		const html = createSanitizedHtml('<p><img src="https://cdn.sanity.io/foto.jpg" alt="Foto"/></p>');

		expect(htmlToPlainText(html)).toBe('');
	});
});
