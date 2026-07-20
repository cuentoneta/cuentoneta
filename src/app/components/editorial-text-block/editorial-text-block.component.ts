import { Component, computed, input } from '@angular/core';

import { Epigraph } from '@models/story.model';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

export type EditorialTextBlockVariant = 'note' | 'highlight';

@Component({
	selector: 'cuentoneta-editorial-text-block',
	imports: [PortableTextParserComponent],
	template: `
		@if (variant() === 'highlight') {
			<div class="w-1 self-stretch rounded-full bg-brand-400" data-testid="accent-bar"></div>
		}
		<div class="source-serif-lg flex flex-1 flex-col font-normal {{ textClasses() }}">
			<cuentoneta-portable-text-parser [paragraphs]="content().text" />
			@if (hasReference()) {
				<div class="text-end" data-testid="reference">
					<em><cuentoneta-portable-text-parser [paragraphs]="content().reference" /></em>
				</div>
			}
		</div>
	`,
	host: {
		'[class]': 'hostClasses()',
		'data-testid': 'editorial-text-block',
	},
})
export class EditorialTextBlockComponent {
	public readonly content = input.required<Epigraph>();
	public readonly variant = input<EditorialTextBlockVariant>('note');

	protected readonly hasReference = computed(() => this.content().reference.length > 0);

	private readonly variantClasses: Record<EditorialTextBlockVariant, { container: string; text: string }> = {
		note: { container: 'rounded-xl border border-neutral-150 bg-neutral-50 px-5 py-4', text: 'text-neutral-800' },
		highlight: { container: 'gap-4 rounded-lg bg-brand-50 p-2', text: 'text-neutral-700' },
	};

	protected readonly textClasses = computed(() => this.variantClasses[this.variant()].text);

	protected readonly hostClasses = computed(() => `flex items-center ${this.variantClasses[this.variant()].container}`);
}
