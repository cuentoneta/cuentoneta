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
				<div [outerHtml]="safeContent()"></div>
			</blockquote>
		} @else {
			<aside [class]="bodyClasses()" data-testid="body">
				<div [outerHtml]="safeContent()"></div>
			</aside>
		}
		@if (safeReference(); as reference) {
			<figcaption>
				<cite [innerHTML]="reference" class="text-end italic" data-testid="reference"></cite>
			</figcaption>
		}
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
