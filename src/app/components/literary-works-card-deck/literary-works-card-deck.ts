import { Component, input } from '@angular/core';

import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { LiteraryWorkHomeCardTeaserComponent } from '../literary-work-home-card-teaser/literary-work-home-card-teaser.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from '../literary-work-home-card-teaser/literary-work-home-card-teaser-skeleton.component';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';

/**
 * Grilla de obras destacadas de la página de inicio, según el Design System v3.
 *
 * El encabezado llega por input porque la página monta dos instancias —novedades y más leídas— que solo
 * difieren en su copy y su destino: eran dos componentes idénticos que ya habían empezado a divergir.
 */
@Component({
	selector: 'cuentoneta-literary-works-card-deck',
	imports: [SectionHeaderComponent, LiteraryWorkHomeCardTeaserComponent, LiteraryWorkHomeCardTeaserSkeletonComponent],
	template: `
		<cuentoneta-section-header
			[heading]="heading()"
			[subtitle]="subtitle()"
			[actionLink]="actionLink()"
			[actionAriaLabel]="actionAriaLabel()"
		/>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
			@defer (when literaryWorks().length > 0) {
				@for (literaryWork of literaryWorks(); track literaryWork.slug) {
					<cuentoneta-literary-work-home-card-teaser
						[literaryWork]="literaryWork"
						[order]="$index + 1"
						[navigationParams]="{
							navigation: 'author',
							navigationSlug: literaryWork.authors[0].slug,
						}"
						data-testid="card"
					/>
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(skeletonCount); track $index) {
					<cuentoneta-literary-work-home-card-teaser-skeleton data-testid="skeleton" />
				}
			}
		</section>
	`,
	host: {
		class: 'mb-8 flex flex-col gap-8',
		// El nombre de región es lo que deja localizar cada instancia sin depender de su posición en la
		// página: las dos montan el mismo componente y solo su encabezado las distingue.
		role: 'region',
		'[attr.aria-label]': 'heading()',
	},
})
export class LiteraryWorksCardDeck {
	protected readonly skeletonCount = 6;

	public readonly literaryWorks = input<readonly LiteraryWorkNavigationTeaserWithAuthors[]>([]);
	public readonly heading = input.required<string>();
	public readonly subtitle = input<string>('');
	public readonly actionLink = input<readonly string[]>([]);
	public readonly actionAriaLabel = input<string>('');
}
