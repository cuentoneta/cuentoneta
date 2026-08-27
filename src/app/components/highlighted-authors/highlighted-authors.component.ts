import { Component, input } from '@angular/core';

import type { HighlightedAuthor } from '@models/landing-page-content.model';
import { AppRoutes } from '../../app.routes';
import { SectionHeaderComponent, type SectionHeaderAction } from '@components/section-header/section-header.component';
import { EmptyStateComponent } from '@components/empty-state/empty-state.component';
import { AuthorCardTeaserComponent } from '@components/author-card-teaser/author-card-teaser.component';
import { AuthorCardTeaserSkeletonComponent } from '@components/author-card-teaser/author-card-teaser-skeleton.component';

/**
 * Sección de autores destacados de la página de inicio, según el Design System v3: cabecera con enlace al
 * índice de autores y una grilla de vistas previas de autor.
 *
 * La curaduría es semanal y la decide la edición, así que el componente solo presenta lo que recibe: no
 * recorta ni ordena. El tope de seis lo aplica el backend.
 */
@Component({
	selector: 'cuentoneta-highlighted-authors',
	imports: [SectionHeaderComponent, EmptyStateComponent, AuthorCardTeaserComponent, AuthorCardTeaserSkeletonComponent],
	template: `
		<cuentoneta-section-header
			[heading]="sectionHeading"
			[action]="action"
			subtitle="Una selección curada de autores y autoras imprescindibles"
		/>

		@if (loading()) {
			<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				@for (_ of [].constructor(skeletonCount); track $index) {
					<cuentoneta-author-card-teaser-skeleton class="w-full" data-testid="skeleton" />
				}
			</section>
		} @else if (authors().length > 0) {
			<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				@for (highlighted of authors(); track highlighted.author._id) {
					<cuentoneta-author-card-teaser
						[author]="highlighted.author"
						[tags]="highlighted.tags"
						[storyCount]="highlighted.storyCount"
						class="w-full"
					/>
				}
			</section>
		} @else {
			<cuentoneta-empty-state message="Todavía no hay autores destacados esta semana." />
		}
	`,
	host: {
		class: 'flex flex-col gap-8',
		role: 'region',
		'[attr.aria-label]': 'sectionHeading',
	},
})
export class HighlightedAuthorsComponent {
	// El mismo tope que el backend aplica a la curaduría: la grilla en carga dibuja la sección llena.
	protected readonly skeletonCount = 6;
	// Una sola declaración para el <h2> y para el nombre de la región: dos literales se desincronizan.
	protected readonly sectionHeading = 'Autores/as destacados/as';
	protected readonly action: SectionHeaderAction = {
		link: ['/', AppRoutes.Authors],
		accessibleSuffix: 'el índice de autores',
	};

	public readonly authors = input<readonly HighlightedAuthor[]>([]);
	/** El dueño del recurso es la página, así que el estado de carga entra por input. */
	public readonly loading = input(false);
}
