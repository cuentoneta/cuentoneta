import { markdownToSanitizedHtml } from './markdown-pipeline.utils';
import { createMarkdown } from '@models/markdown.model';

describe('markdownToSanitizedHtml', () => {
	it('converts basic markdown to HTML', () => {
		const html = markdownToSanitizedHtml(createMarkdown('## Título\n\nUn párrafo con **negrita**.'));

		expect(html).toContain('<h2>Título</h2>');
		expect(html).toContain('<p>Un párrafo con <strong>negrita</strong>.</p>');
	});

	// La cita es lo que reexpresa un pasaje que el original marcaba con alineación, que Markdown no
	// tiene. Si alguien acotara la allow-list y `blockquote` cayera, ese pasaje se descartaría al
	// renderizar y la obra quedaría peor que sin la marca.
	it('preserves blockquotes and emphasis', () => {
		const html = markdownToSanitizedHtml(
			createMarkdown('> **UN AVISO**\n>\n> El cuerpo del aviso.\n\nUn beso de tu\n\n*José*'),
		);

		expect(html).toContain('<blockquote>');
		expect(html).toContain('<p><strong>UN AVISO</strong></p>');
		expect(html).toContain('<p>El cuerpo del aviso.</p>');
		expect(html).toContain('<p><em>José</em></p>');
	});

	// El verso y el epígrafe cortan la línea sin cerrar el párrafo, y CommonMark serializaría ese
	// salto como un espacio. Los tres casos siguientes fijan las tres aristas de tratarlo como salto
	// duro: que el salto simple sobreviva, que no se coma la separación de párrafos, y que el salto
	// duro clásico siga rindiendo uno solo.
	it('preserves single line breaks within a paragraph', () => {
		const html = markdownToSanitizedHtml(createMarkdown("I'm looking for the face I had\nBefore the world was made."));

		expect(html).toContain('<br>');
		expect(html).not.toContain('I had Before');
	});

	it('keeps paragraphs separate rather than joining them with a line break', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Primer párrafo.\n\nSegundo párrafo.'));

		expect(html).toContain('<p>Primer párrafo.</p>');
		expect(html).toContain('<p>Segundo párrafo.</p>');
		expect(html).not.toContain('<br>');
	});

	it('renders a single break for the classic two-space hard break', () => {
		const html = markdownToSanitizedHtml(createMarkdown('Primera línea.  \nSegunda línea.'));

		expect([...html.matchAll(/<br>/g)]).toHaveLength(1);
	});

	// Batería XSS: cada payload mezcla prosa benigna (así la salida no es vacía y no lanza por el
	// invariante de SanitizedHtml) con un constructo peligroso que la allow-list debe neutralizar.
	// `forbidden` reconoce el constructo peligroso *como tag o atributo*, no como texto: una obra
	// puede mencionar "javascript:" en su prosa y ahí llega escapado e inerte (ver el vector autolink).
	//
	// Dos familias con la misma expectativa (el vector no atraviesa):
	//  - HTML crudo: el pipeline no usa rehype-raw/allowDangerousHtml, así que remark-rehype descarta
	//    el HTML embebido entero antes de llegar al sanitizador. Estos casos también son el guard de
	//    regresión que se pondría rojo si alguien habilitara HTML crudo (p. ej. el `srcset` crudo, que
	//    la allow-list de `img` no filtra por protocolo, quedaría vivo si el `<img>` sobreviviera).
	//  - Markdown-nativo: los constructos que sí llegan al sanitizador (links e imágenes) — se les cae
	//    el `href`/`src` con protocolo peligroso, dejando el elemento inerte.
	const BENIGN = 'texto-benigno-visible';
	const xssVectors: ReadonlyArray<{ name: string; markdown: string; forbidden: RegExp }> = [
		// HTML crudo — descartado entero por remark-rehype.
		{ name: '<script> embebido', markdown: `${BENIGN}\n\n<script>alert(1)</script>`, forbidden: /<\s*script/i },
		{
			name: '<iframe>',
			markdown: `${BENIGN}\n\n<iframe src="https://evil.example"></iframe>`,
			forbidden: /<\s*iframe/i,
		},
		{ name: '<object>', markdown: `${BENIGN}\n\n<object data="evil.swf"></object>`, forbidden: /<\s*object/i },
		{ name: '<embed>', markdown: `${BENIGN}\n\n<embed src="evil.swf">`, forbidden: /<\s*embed/i },
		{ name: '<form>', markdown: `${BENIGN}\n\n<form action="/x"><input></form>`, forbidden: /<\s*form/i },
		{ name: '<base href>', markdown: `${BENIGN}\n\n<base href="https://evil.example/">`, forbidden: /<\s*base/i },
		{ name: '<style> tag', markdown: `${BENIGN}\n\n<style>body{display:none}</style>`, forbidden: /<\s*style/i },
		{
			name: '<svg><use href=javascript>',
			markdown: `${BENIGN}\n\n<svg><use href="javascript:alert(1)"></use></svg>`,
			forbidden: /<\s*svg/i,
		},
		{ name: '<img onerror>', markdown: `${BENIGN}\n\n<img src=x onerror="alert(1)">`, forbidden: /\sonerror\s*=/i },
		{
			name: 'onmouseover en <span>',
			markdown: `${BENIGN}\n\n<span onmouseover="alert(1)">hover</span>`,
			forbidden: /\sonmouseover\s*=/i,
		},
		{
			name: 'onclick en <div>',
			markdown: `${BENIGN}\n\n<div onclick="alert(1)">click</div>`,
			forbidden: /\sonclick\s*=/i,
		},
		{
			name: 'style inline en <p>',
			markdown: `${BENIGN}\n\n<p style="background:url(javascript:alert(1))">x</p>`,
			forbidden: /\sstyle\s*=/i,
		},
		{
			name: 'srcset crudo con javascript:',
			markdown: `${BENIGN}\n\n<img src="https://cdn.sanity.io/a-1x1.jpg" srcset="javascript:alert(1) 2x">`,
			forbidden: /srcset[^>]*javascript/i,
		},
		{
			name: 'srcset crudo con data:text/html',
			markdown: `${BENIGN}\n\n<img src="a.jpg" srcset="data:text/html,<b>x</b> 2x">`,
			forbidden: /srcset[^>]*data:text\/html/i,
		},
		{
			name: 'src crudo con data:text/html',
			markdown: `${BENIGN}\n\n<img src="data:text/html,<script>alert(1)</script>">`,
			forbidden: /src\s*=\s*["']?\s*data:text\/html/i,
		},
		// Markdown-nativo — el sanitizador descarta el protocolo peligroso del href/src.
		{
			name: 'link markdown javascript:',
			markdown: `${BENIGN} [click](javascript:alert(1))`,
			forbidden: /href\s*=\s*["']?\s*javascript/i,
		},
		{
			name: 'link markdown JaVaScRiPt: (mixed case)',
			markdown: `${BENIGN} [click](JaVaScRiPt:alert(1))`,
			forbidden: /href\s*=\s*["']?\s*javascript/i,
		},
		{
			name: 'link markdown vbscript:',
			markdown: `${BENIGN} [click](vbscript:msgbox(1))`,
			forbidden: /href\s*=\s*["']?\s*vbscript/i,
		},
		{
			name: 'link markdown data:text/html',
			markdown: `${BENIGN} [click](data:text/html,<script>alert(1)</script>)`,
			forbidden: /href\s*=\s*["']?\s*data:text\/html/i,
		},
		{
			name: 'autolink javascript: queda como texto inerte',
			markdown: `${BENIGN} <javascript:alert(1)>`,
			forbidden: /href\s*=\s*["']?\s*javascript/i,
		},
		{
			name: 'imagen markdown javascript:',
			markdown: `${BENIGN} ![x](javascript:alert(1))`,
			forbidden: /src\s*=\s*["']?\s*javascript/i,
		},
		{
			name: 'imagen markdown data:text/html',
			markdown: `${BENIGN} ![x](data:text/html,<script>alert(1)</script>)`,
			forbidden: /src\s*=\s*["']?\s*data:text\/html/i,
		},
	];

	it.each(xssVectors)('neutraliza el vector: $name', ({ markdown, forbidden }) => {
		const html = markdownToSanitizedHtml(createMarkdown(markdown));

		// El constructo peligroso no atraviesa la allow-list...
		expect(html).not.toMatch(forbidden);
		// ...y el pipeline no colapsó la salida: el contenido benigno sobrevive y el valor branda
		// como SanitizedHtml (markdownToSanitizedHtml habría lanzado si el guard de frontera lo rechazara).
		expect(html).toContain(BENIGN);
	});

	it('preserves legitimate external and relative links', () => {
		const html = markdownToSanitizedHtml(createMarkdown('[externo](https://example.com) y [interno](/story/algo)'));

		expect(html).toContain('href="https://example.com"');
		expect(html).toContain('href="/story/algo"');
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

	it('does not enrich a non-Sanity URL even if it mimics the WxH pattern', () => {
		const html = markdownToSanitizedHtml(createMarkdown('![impostora](https://example.com/foto-800x600.jpg)'));

		expect(html).not.toContain('srcset');
		expect(html).not.toContain('width=');
	});

	it('propagates the SanitizedHtml invariant for empty rendered output', () => {
		expect(() => markdownToSanitizedHtml(createMarkdown('<!-- solo un comentario -->'))).toThrow(
			'SanitizedHtml inválido: contenido vacío',
		);
	});
});
