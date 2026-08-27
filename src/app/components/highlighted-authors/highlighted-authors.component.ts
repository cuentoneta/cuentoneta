import { Component, input } from '@angular/core';

import type { HighlightedAuthor } from '@models/landing-page-content.model';
import { AppRoutes } from '../../app.routes';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
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
	imports: [SectionHeaderComponent, AuthorCardTeaserComponent, AuthorCardTeaserSkeletonComponent],
	template: `
		<cuentoneta-section-header
			[actionLink]="authorsLink"
			heading="Autores/as destacados/as"
			subtitle="Una selección curada de autores y autoras imprescindibles"
			actionAriaLabel="Ver todos los autores"
		/>

		<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			@defer (when authors().length > 0) {
				@for (highlighted of authors(); track highlighted.author._id) {
					<cuentoneta-author-card-teaser
						[author]="highlighted.author"
						[tags]="highlighted.tags"
						[storyCount]="highlighted.storyCount"
						class="w-full"
					/>
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(SKELETON_COUNT); track $index) {
					<cuentoneta-author-card-teaser-skeleton class="w-full" data-testid="skeleton" />
				}
			}
		</section>
	`,
	host: {
		class: 'flex flex-col gap-8',
		// El nombre de región es lo que deja localizar la sección sin depender de su posición en la página.
		role: 'region',
		'aria-label': 'Autores/as destacados/as',
	},
})
export class HighlightedAuthorsComponent {
	// El mismo tope que el backend aplica a la curaduría: la grilla en carga dibuja la sección llena.
	protected readonly SKELETON_COUNT = 6;
	protected readonly authorsLink = ['/', AppRoutes.Authors];

	public readonly authors = input<readonly HighlightedAuthor[]>([]);
}
