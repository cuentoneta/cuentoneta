import { Directive, ElementRef, Renderer2, effect, input, inject } from '@angular/core';
import { TextBlockContent } from '@models/block-content.model';

@Directive({
	selector: '[cuentonetaPortableText]',
	standalone: true,
})
export class PortableTextDirective {
	private readonly el = inject(ElementRef);
	private readonly renderer = inject(Renderer2);

	public readonly portableText = input.required<TextBlockContent>();
	public readonly classes = input<string>('');

	constructor() {
		effect(() => {
			this.render(this.portableText(), this.classes());
		});
	}

	// La alineación llega como marca y sale como clase de utilidad.
	private readonly alignmentClasses: Readonly<Record<string, string>> = Object.freeze({
		center: 'text-center',
		left: 'text-left',
		right: 'text-right',
		justify: 'text-justify',
	});

	private render(content: TextBlockContent, classes: string) {
		this.clearHost();
		this.applyClasses(this.appendClasses(content, classes));
		content.children.forEach((block) => this.renderBlock(content, block));
	}

	private clearHost(): void {
		while (this.el.nativeElement.firstChild) {
			this.el.nativeElement.removeChild(this.el.nativeElement.firstChild);
		}
		this.el.nativeElement.className = '';
	}

	private applyClasses(classes: string): void {
		classes
			.split(' ')
			.filter(Boolean)
			.forEach((className) => this.renderer.addClass(this.el.nativeElement, className.trim()));
	}

	private renderBlock(content: TextBlockContent, block: TextBlockContent['children'][number]): void {
		const marks = (block.marks ?? []).slice(0);

		this.applyClasses(marks.map((mark) => this.alignmentClasses[mark] ?? '').join(' '));

		// Un salto de línea parte el texto en nodos con `br` en el medio, así que se emite directo al
		// host: las marcas envuelven un nodo único y no sobrevivirían a esa partición.
		if (block.text.includes('\n')) {
			this.appendWithLineBreaks(block.text);
			return;
		}

		let element: HTMLElement | Text = this.renderer.createText(block.text);
		element = this.wrapWithMarks(element, marks);
		element = this.wrapWithLink(element, content, marks);
		this.renderer.appendChild(this.el.nativeElement, element);
	}

	// TODO: Agregar procesamiento de otros tipos de marks (h1, h2, highlight, tachado, subrayado, etc.)
	private readonly markTags: Readonly<Record<string, string>> = Object.freeze({ em: 'i', strong: 'b' });

	private wrapWithMarks(element: HTMLElement | Text, marks: string[]): HTMLElement | Text {
		let wrapped = element;
		for (const [mark, tag] of Object.entries(this.markTags)) {
			if (marks.includes(mark)) {
				const parent = this.renderer.createElement(tag);
				this.renderer.appendChild(parent, wrapped);
				wrapped = parent;
			}
		}
		return wrapped;
	}

	private wrapWithLink(element: HTMLElement | Text, content: TextBlockContent, marks: string[]): HTMLElement | Text {
		const linkDef = content.markDefs?.find((def) => def._type === 'link' && marks.includes(def._key));
		if (!linkDef) {
			return element;
		}

		const linkElement = this.renderer.createElement('a');
		this.renderer.setAttribute(linkElement, 'href', linkDef.href || '#');
		this.renderer.addClass(linkElement, 'underline');
		this.renderer.appendChild(linkElement, element);
		return linkElement;
	}

	private appendWithLineBreaks(text: string): void {
		text.split('\n').forEach((part, index) => {
			if (index > 0) {
				this.renderer.appendChild(this.el.nativeElement, this.renderer.createElement('br'));
			}
			this.renderer.appendChild(this.el.nativeElement, this.renderer.createText(part));
		});
	}

	private appendClasses(paragraph: TextBlockContent, classes: string): string {
		const blocks = paragraph.children;
		// TODO: Buscar todos los usos de estos separadores y eliminarlos del proyecto, utilizando la alineación de texto en su lugar
		const includeSeparators = blocks.filter((block) => block.text.includes('***')).length > 0;

		if (includeSeparators) {
			classes = `text-center ${classes}`;
		}

		return classes;
	}
}
