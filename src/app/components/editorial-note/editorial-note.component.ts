import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { AttributedText } from '@models/attributed-text.model';

export type EditorialNoteVariant = 'note' | 'highlight';

@Component({
	selector: 'cuentoneta-editorial-note',
	template: `
		@if (variant() === 'highlight') {
			<div class="w-1 self-stretch rounded-full bg-brand-400" data-testid="accent-bar"></div>
		}
		<figure [class]="bodyClasses()" data-testid="body">
			@if (variant() === 'highlight') {
				<blockquote [innerHTML]="safeContent()" [attr.aria-label]="label()" data-testid="content"></blockquote>
			} @else {
				<aside [innerHTML]="safeContent()" [attr.aria-label]="label()" data-testid="content"></aside>
			}
			@if (safeReference(); as reference) {
				<figcaption class="text-end italic" data-testid="reference">
					<cite [innerHTML]="reference" data-testid="reference-source"></cite>
				</figcaption>
			}
		</figure>
	`,
	host: {
		'[class]': 'hostClasses()',
		'data-testid': 'editorial-note',
	},
})
export class EditorialNoteComponent {
	public readonly note = input.required<AttributedText>();
	public readonly variant = input<EditorialNoteVariant>('note');

	// Nombre accesible del bloque. En la variante `note` además lo vuelve un landmark: un `<aside>`
	// anidado en contenido seccionador solo cuenta como región navegable si tiene nombre, y sin él la
	// voz del editor se lee como una continuación de la obra.
	public readonly label = input<string>();

	private readonly sanitizer = inject(DomSanitizer);

	private readonly variantClasses: Record<EditorialNoteVariant, { container: string; text: string }> = {
		note: { container: 'rounded-xl border border-neutral-150 bg-neutral-50 px-5 py-4', text: 'text-neutral-800' },
		highlight: { container: 'gap-4 rounded-lg bg-brand-50 p-2', text: 'text-neutral-700' },
	};

	protected readonly safeContent = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.note().text));

	protected readonly safeReference = computed(() => {
		const { reference } = this.note();
		return reference ? this.sanitizer.bypassSecurityTrustHtml(reference) : undefined;
	});

	protected readonly bodyClasses = computed(
		() => `source-serif-lg flex flex-1 flex-col font-normal ${this.variantClasses[this.variant()].text}`,
	);

	protected readonly hostClasses = computed(() => `flex items-center ${this.variantClasses[this.variant()].container}`);
}
