import { Component, input } from '@angular/core';

import { SectionHeaderComponent, type SectionHeaderAction } from '@components/section-header/section-header.component';
import { EmptyStateComponent } from '@components/empty-state/empty-state.component';
import { LiteraryWorkHomeCardTeaserComponent } from '../literary-work-home-card-teaser/literary-work-home-card-teaser.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from '../literary-work-home-card-teaser/literary-work-home-card-teaser-skeleton.component';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';

/**
 * Grilla de obras del Design System v3: un encabezado de sección opcional sobre una tirada de vistas
 * previas de obra.
 *
 * Todo lo que distingue a una tirada de otra —su título, su bajada y a dónde lleva su acción— entra por
 * input, así que una misma página puede montar varias y cualquier otra puede reusarlo. Sin encabezado
 * queda la grilla sola, para quien ya la anuncia por su cuenta.
 */
@Component({
	selector: 'cuentoneta-literary-works-card-deck',
	imports: [
		SectionHeaderComponent,
		EmptyStateComponent,
		LiteraryWorkHomeCardTeaserComponent,
		LiteraryWorkHomeCardTeaserSkeletonComponent,
	],
	template: `
		@if (heading() || subtitle()) {
			<cuentoneta-section-header [heading]="heading()" [subtitle]="subtitle()" [action]="action()" />
		}

		@if (loading()) {
			<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
				@for (_ of [].constructor(skeletonCount); track $index) {
					<cuentoneta-literary-work-home-card-teaser-skeleton data-testid="skeleton" />
				}
			</section>
		} @else if (literaryWorks().length > 0) {
			<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
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
			</section>
		} @else {
			<cuentoneta-empty-state [message]="emptyMessage()" />
		}
	`,
	host: {
		class: 'mb-8 flex flex-col gap-8',
		// El nombre de región es lo que deja localizar cada instancia sin depender de su posición en la
		// página, cuando hay varias. Sin encabezado no hay nombre, y una región anónima estorba más de lo
		// que ayuda: quien no declara título es porque anuncia la sección por su cuenta.
		'[attr.role]': "heading() ? 'region' : null",
		'[attr.aria-label]': 'heading() || null',
	},
})
export class LiteraryWorksCardDeck {
	protected readonly skeletonCount = 6;

	public readonly literaryWorks = input<readonly LiteraryWorkNavigationTeaserWithAuthors[]>([]);
	public readonly heading = input<string>('');
	public readonly subtitle = input<string>('');
	public readonly action = input<SectionHeaderAction | undefined>(undefined);
	/** El dueño del recurso es la página, así que el estado de carga entra por input. */
	public readonly loading = input(false);
	public readonly emptyMessage = input<string>('Todavía no hay obras para mostrar acá.');
}
