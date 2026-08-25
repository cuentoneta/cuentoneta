import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HighlightedAuthor } from '@models/landing-page-content.model';
import { AppRoutes } from '../../app.routes';
import { ButtonComponent } from '@components/button/button.component';
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
	imports: [RouterLink, ButtonComponent, AuthorCardTeaserComponent, AuthorCardTeaserSkeletonComponent],
	template: `
		<div class="flex items-center justify-between gap-4">
			<div class="flex flex-col content-between gap-1">
				<h2 class="font-inter text-2xl font-bold">Autores/as destacados/as</h2>
				<div class="font-inter text-sm text-neutral-600">Una selección curada de autores y autoras imprescindibles</div>
			</div>
			<!-- El nombre visible no dice adónde lleva fuera de su contexto visual, y va a competir con el
			     de cualquier sección hermana que sume el suyo. -->
			<a
				[routerLink]="['/', appRoutes.Authors]"
				cuentoneta-button
				variant="outline"
				size="sm"
				class="shrink-0"
				aria-label="Ver todos los autores"
			>
				Ver todo
			</a>
		</div>

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
				<!-- Un esqueleto por destacado recibido, y no una cantidad fija: es lo que hace que el alto de
				     la grilla en carga coincida con el real por construcción, sin fijarlo desde afuera. -->
				@for (_ of authors(); track $index) {
					<cuentoneta-author-card-teaser-skeleton class="w-full" data-testid="skeleton" />
				}
			}
		</section>
	`,
	host: {
		class: 'flex flex-col gap-8',
	},
})
export class HighlightedAuthorsComponent {
	protected readonly appRoutes = AppRoutes;

	public readonly authors = input<readonly HighlightedAuthor[]>([]);
}
