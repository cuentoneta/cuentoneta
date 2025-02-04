import { Directive, ElementRef, Renderer2, effect, input, inject } from '@angular/core';
import { TextBlockContent } from '@models/block-content.model';

@Directive({
	selector: '[cuentonetaPortableText]',
	standalone: true,
})
export class PortableTextDirective {
	private el = inject(ElementRef);
	private renderer = inject(Renderer2);

	portableText = input.required<TextBlockContent>();
	classes = input<string>('');

	constructor() {
		effect(() => {
			this.render(this.portableText(), this.classes());
		});
	}

	private render(content: TextBlockContent, classes: string) {
		// Limpia el contenido actual
		while (this.el.nativeElement.firstChild) {
			this.el.nativeElement.removeChild(this.el.nativeElement.firstChild);
		}

		// Elimina las clases actuales
		this.el.nativeElement.className = '';

		// Agrega las clases en base a las pasadas como input
		const updatedClasses = this.appendClasses(content, classes);
		if (updatedClasses) {
			updatedClasses.split(' ').forEach((className) => {
				if (className) {
					this.renderer.addClass(this.el.nativeElement, className.trim());
				}
			});
		}

		// Process and append content
		content.children.forEach((block) => {
			let element: HTMLElement | Text = this.renderer.createText(block.text);
			const marks = (block.marks ?? []).slice(0);

			// Procesar marks (em, string, etc.)
			// TODO: Agregar procesamiento de otros tipos de marks (h1, h2, highlight, tachado, subrayado, etc.)
			if (marks.includes('em')) {
				const emElement = this.renderer.createElement('i');
				this.renderer.appendChild(emElement, element);
				element = emElement;
			}

			if (marks.includes('strong')) {
				const strongElement = this.renderer.createElement('b');
				this.renderer.appendChild(strongElement, element);
				element = strongElement;
			}

			// Procesar texto con URLs
			if (content.markDefs?.length && marks.length) {
				const linkDef = content.markDefs.find((def) => def._type === 'link' && marks.includes(def._key));

				if (linkDef) {
					const linkElement = this.renderer.createElement('a');
					this.renderer.setAttribute(linkElement, 'href', linkDef.href || '#');
					this.renderer.addClass(linkElement, 'underline');
					this.renderer.appendChild(linkElement, element);
					element = linkElement;
				}
			}

			// Manejo de saltos de línea
			if (block.text.includes('\n')) {
				const parts = block.text.split('\n');
				parts.forEach((part, index) => {
					if (index > 0) {
						const br = this.renderer.createElement('br');
						this.renderer.appendChild(this.el.nativeElement, br);
					}
					const textNode = this.renderer.createText(part);
					this.renderer.appendChild(this.el.nativeElement, textNode);
				});
			} else {
				this.renderer.appendChild(this.el.nativeElement, element);
			}
		});
	}

	private appendClasses(paragraph: TextBlockContent, classes: string): string {
		const blocks = paragraph.children;
		const includeSeparators = blocks.filter((block) => block.text.includes('***')).length > 0;

		if (includeSeparators) {
			classes = `text-center ${classes}`;
		}

		return classes;
	}
}
