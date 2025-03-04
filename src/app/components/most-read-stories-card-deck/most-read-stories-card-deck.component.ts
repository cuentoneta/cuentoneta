import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCardTeaserComponent } from '../story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '../story-card-teaser/story-card-teaser-skeleton.component';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';

@Component({
	selector: 'cuentoneta-most-read-stories-card-deck',
	imports: [CommonModule, StoryCardTeaserComponent, StoryCardTeaserSkeletonComponent],
	template: ` <div class="flex content-between items-center gap-4 text-gray-500">
			<hr class="w-6" />
			<h2 class="h3 text-center font-source-serif italic">Historias más leídas</h2>
			<hr class="flex-grow" />
		</div>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
			@defer (when stories().length > 0) {
				@for (story of stories(); track $index) {
					<cuentoneta-story-card-teaser
						[story]="story"
						[showAuthor]="true"
						[order]="$index + 1"
						[navigationParams]="{
							navigation: 'author',
							navigationSlug: story.author.slug
						}"
						data-testid="card"
					/>
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(6); track $index) {
					<cuentoneta-story-card-teaser-skeleton [showAuthor]="true" [order]="$index + 1" data-testid="skeleton" />
				}
			}
		</section>`,
	styles: `
		:host {
			@apply mb-8 flex flex-col gap-8;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostReadStoriesCardDeckComponent {
	stories = input<StoryNavigationTeaserWithAuthor[]>([]);
}
