import { Component, input } from '@angular/core';
import type { CollectionTeaser } from '@models/collection.model';
import { AppRoutes } from '../../app.routes';
import { SectionHeaderComponent, type SectionHeaderAction } from '@components/section-header/section-header.component';
import { EmptyStateComponent } from '@components/empty-state/empty-state.component';
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

@Component({
	selector: 'cuentoneta-collection-teasers-deck',
	imports: [SectionHeaderComponent, EmptyStateComponent, CollectionTeaserCard, CollectionTeaserCardSkeletonComponent],
	template: `
		<cuentoneta-section-header
			[heading]="sectionHeading"
			[action]="action"
			subtitle="Obras agrupadas por temas, estilos y universos en común"
		/>

		<!-- La grilla se declara una sola vez para las dos ramas: que el esqueleto caiga exactamente en la
		misma caja que la tarjeta es lo que evita el salto al terminar de cargar. -->
		@if (loading() || teasers().length > 0) {
			<section class="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2">
				@if (loading()) {
					@for (_ of [].constructor(skeletonCount); track $index) {
						<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
					}
				} @else {
					@for (collection of teasers(); track collection.slug) {
						<cuentoneta-collection-teaser-card [collection]="collection" class="card w-full" />
					}
				}
			</section>
		} @else {
			<cuentoneta-empty-state message="Todavía no hay colecciones para mostrar esta semana." />
		}
	`,
	host: {
		class: 'flex flex-col gap-8',
		role: 'region',
		'[attr.aria-label]': 'sectionHeading',
	},
})
export class CollectionTeasersDeck {
	protected readonly skeletonCount = 4;
	// Una sola declaración para el <h2> y para el nombre de la región: dos literales se desincronizan.
	protected readonly sectionHeading = 'Colecciones';
	protected readonly action: SectionHeaderAction = {
		link: ['/', AppRoutes.Collection],
		accessibleSuffix: 'el índice de colecciones',
	};

	public readonly teasers = input<readonly CollectionTeaser[]>([]);
	/** El dueño del recurso es la página, así que el estado de carga entra por input. */
	public readonly loading = input(false);
}
