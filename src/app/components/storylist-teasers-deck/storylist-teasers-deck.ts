import { Component, input } from '@angular/core';
import { StorylistTeaser } from '@models/storylist.model';
import { StorylistTeaserCard } from '@components/storylist-teaser-card/storylist-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

@Component({
	selector: 'cuentoneta-storylist-teasers-deck',
	imports: [StorylistTeaserCard, CollectionTeaserCardSkeletonComponent],
	template: ` <div class="flex items-center justify-between">
			<div class="flex flex-col content-between gap-1">
				<h2 class="font-inter text-2xl font-bold">Colecciones</h2>
				<div class="font-inter text-sm text-neutral-600">
					Historias agrupadas por temas, estilos y universos en común
				</div>
			</div>
		</div>

		<section class="mb-8 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2">
			@defer (when teasers().length > 0) {
				@for (storylist of teasers(); track storylist.slug) {
					<cuentoneta-storylist-teaser-card [collection]="storylist" class="card w-full" />
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(SKELETON_COUNT); track $index) {
					<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
				}
			}
		</section>`,
	host: {
		class: 'flex flex-col gap-8',
	},
})
export class StorylistTeasersDeck {
	protected readonly SKELETON_COUNT = 4;
	public readonly teasers = input<StorylistTeaser[]>([]);
}
