import { Component, input } from '@angular/core';

import { LiteraryWorkHomeCardTeaserComponent } from '../literary-work-home-card-teaser/literary-work-home-card-teaser.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from '../literary-work-home-card-teaser/literary-work-home-card-teaser-skeleton.component';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';

@Component({
	selector: 'cuentoneta-most-read-stories-card-deck',
	imports: [LiteraryWorkHomeCardTeaserComponent, LiteraryWorkHomeCardTeaserSkeletonComponent],
	template: ` <div class="flex content-between items-center gap-4 text-neutral-500">
			<hr class="w-6" />
			<h2 class="h3 text-center font-source-serif italic">Historias más leídas</h2>
			<hr class="flex-grow" />
		</div>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
			@defer (when literaryWorks().length > 0) {
				@for (literaryWork of literaryWorks(); track literaryWork.slug) {
					<cuentoneta-literary-work-home-card-teaser
						[literaryWork]="literaryWork"
						[order]="$index + 1"
						[navigationParams]="{
							navigation: 'author',
							navigationSlug: literaryWork.authors[0]?.slug,
						}"
						data-testid="card"
					/>
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(SKELETON_COUNT); track $index) {
					<cuentoneta-literary-work-home-card-teaser-skeleton data-testid="skeleton" />
				}
			}
		</section>`,
	host: {
		class: 'mb-8 flex flex-col gap-8',
	},
})
export class MostReadStoriesCardDeckComponent {
	protected readonly SKELETON_COUNT = 6;
	public readonly literaryWorks = input<readonly LiteraryWorkNavigationTeaserWithAuthors[]>([]);
}
