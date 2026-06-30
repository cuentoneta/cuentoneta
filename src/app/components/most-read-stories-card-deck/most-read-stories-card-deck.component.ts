import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import { HomeStoryCardComponent } from '@components/home-story-card/home-story-card.component';
import { HomeStoryCardSkeletonComponent } from '@components/home-story-card/home-story-card-skeleton.component';

@Component({
	selector: 'cuentoneta-most-read-stories-card-deck',
	imports: [HomeStoryCardComponent, HomeStoryCardSkeletonComponent],
	template: ` <div class="flex content-between items-center gap-4 text-neutral-500">
			<hr class="w-6" />
			<h2 class="h3 text-center font-source-serif italic">Historias más leídas</h2>
			<hr class="flex-grow" />
		</div>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
			@defer (when stories().length > 0) {
				@for (story of stories(); track $index) {
					<cuentoneta-home-story-card
						[story]="story"
						[order]="$index + 1"
						[navigationParams]="{
							navigation: 'author',
							navigationSlug: story.author.slug,
						}"
						data-testid="card"
					/>
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(6); track $index) {
					<cuentoneta-home-story-card-skeleton data-testid="skeleton" />
				}
			}
		</section>`,
	host: {
		class: 'mb-8 flex flex-col gap-8',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostReadStoriesCardDeckComponent {
	public readonly stories = input<StoryNavigationTeaserWithAuthor[]>([]);
}
