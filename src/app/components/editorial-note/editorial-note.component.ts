import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { SanitizedHtml } from '@models/sanitized-html.model';

export type EditorialNoteVariant = 'note' | 'highlight';

@Component({
	selector: 'cuentoneta-editorial-note',
	imports: [NgTemplateOutlet],
	template: `
		@if (variant() === 'highlight') {
			<div class="w-1 self-stretch rounded-full bg-brand-400" data-testid="accent-bar"></div>
			<blockquote [class]="bodyClasses()" data-testid="body">
				<ng-container [ngTemplateOutlet]="body" />
			</blockquote>
		} @else {
			<aside [class]="bodyClasses()" data-testid="body">
				<ng-container [ngTemplateOutlet]="body" />
			</aside>
		}

		<ng-template #body>
			<div [innerHTML]="safeContent()"></div>
			@if (safeReference(); as reference) {
				<footer [innerHTML]="reference" class="text-end italic" data-testid="reference"></footer>
			}
		</ng-template>
	`,
	host: {
		'[class]': 'hostClasses()',
		'data-testid': 'editorial-note',
	},
})
export class EditorialNoteComponent {
	public readonly content = input.required<SanitizedHtml>();
	public readonly reference = input<SanitizedHtml>();
	public readonly variant = input<EditorialNoteVariant>('note');

	private readonly sanitizer = inject(DomSanitizer);

	private readonly variantClasses: Record<EditorialNoteVariant, { container: string; text: string }> = {
		note: { container: 'rounded-xl border border-neutral-150 bg-neutral-50 px-5 py-4', text: 'text-neutral-800' },
		highlight: { container: 'gap-4 rounded-lg bg-brand-50 p-2', text: 'text-neutral-700' },
	};

	// El bypass es la confianza en la frontera del backend, no una sanitización propia: el brand
	// SanitizedHtml solo lo produce el pipeline de la ACL (LITERARY_WORK_DESIGN.md §9), y sin bypass
	// el sanitizer de Angular recortaría atributos que esa allow-list sí permite.
	protected readonly safeContent = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.content()));

	protected readonly safeReference = computed(() => {
		const reference = this.reference();
		return reference ? this.sanitizer.bypassSecurityTrustHtml(reference) : undefined;
	});

	protected readonly bodyClasses = computed(
		() => `source-serif-lg flex flex-1 flex-col font-normal ${this.variantClasses[this.variant()].text}`,
	);

	protected readonly hostClasses = computed(() => `flex items-center ${this.variantClasses[this.variant()].container}`);
}
