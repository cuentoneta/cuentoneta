import { markdownToSanitizedHtml } from './markdown-pipeline.functions';
import { createMarkdown } from '@models/markdown.model';

describe('markdownToSanitizedHtml', () => {
	it('converts basic markdown to HTML', () => {
		const html = markdownToSanitizedHtml(createMarkdown('## Título\n\nUn párrafo con **negrita**.'));

		expect(html).toContain('<h2>Título</h2>');
		expect(html).toContain('<p>Un párrafo con <strong>negrita</strong>.</p>');
	});

	it('neutralizes embedded <script> tags', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Texto\n\n<script>alert(1)</script>\n\nMás texto'));

		expect(html).not.toContain('<script>');
		expect(html).not.toContain('alert(1)');
	});

	it('strips event handlers from raw HTML images', () => {
		const html = markdownToSanitizedHtml(createMarkdown('<img src=x onerror="alert(1)">\n\nTexto'));

		expect(html).not.toContain('onerror');
	});

	it('drops javascript: protocol links', () => {
		const html = markdownToSanitizedHtml(createMarkdown('[click](javascript:alert(1))'));

		expect(html).not.toContain('javascript:');
	});

	it('enriches Sanity CDN images with dimensions, srcset and loading hints', () => {
		const src = 'https://cdn.sanity.io/images/s4dbqkc5/production/abc123-800x600.jpg';
		const html = markdownToSanitizedHtml(createMarkdown(`![Una portada](${src})`));

		expect(html).toContain(`src="${src}"`);
		expect(html).toContain('width="800"');
		expect(html).toContain('height="600"');
		expect(html).toContain(`srcset="${src} 800w"`);
		expect(html).toContain('loading="lazy"');
		expect(html).toContain('decoding="async"');
		expect(html).toContain('alt="Una portada"');
	});

	it('leaves non-Sanity images untouched but sanitized', () => {
		const html = markdownToSanitizedHtml(createMarkdown('![externa](https://example.com/imagen.jpg)'));

		expect(html).toContain('src="https://example.com/imagen.jpg"');
		expect(html).not.toContain('width=');
		expect(html).not.toContain('loading=');
	});

	it('propagates the SanitizedHtml invariant for empty rendered output', () => {
		expect(() => markdownToSanitizedHtml(createMarkdown('<!-- solo un comentario -->'))).toThrow(
			'SanitizedHtml inválido: contenido vacío',
		);
	});
});
