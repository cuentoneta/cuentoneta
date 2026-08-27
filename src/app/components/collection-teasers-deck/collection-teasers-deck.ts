import { Component, input } from '@angular/core';
import type { CollectionTeaser } from '@models/collection.model';
import { AppRoutes } from '../../app.routes';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

@Component({
	selector: 'cuentoneta-collection-teasers-deck',
	imports: [SectionHeaderComponent, CollectionTeaserCard, CollectionTeaserCardSkeletonComponent],
	template: `
		<cuentoneta-section-header
			[actionLink]="collectionsLink"
			heading="Colecciones"
			subtitle="Obras agrupadas por temas, estilos y universos en común"
			actionAriaLabel="Ver todas las colecciones"
		/>

		<section class="mb-8 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2">
			@defer (when teasers().length > 0) {
				@for (collection of teasers(); track collection.slug) {
					<cuentoneta-collection-teaser-card [collection]="collection" class="card w-full" />
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(SKELETON_COUNT); track $index) {
					<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
				}
			}
		</section>
	`,
	host: {
		class: 'flex flex-col gap-8',
		// El nombre de región es lo que deja localizar la sección sin depender de su posición en la página.
		role: 'region',
		'aria-label': 'Colecciones',
	},
})
export class CollectionTeasersDeck {
	protected readonly SKELETON_COUNT = 4;
	protected readonly collectionsLink = ['/', AppRoutes.Collection];

	public readonly teasers = input<readonly CollectionTeaser[]>([]);
}
