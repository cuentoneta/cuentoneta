import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoryNavigationTeaserWithAuthor, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { StoryCardTeaserComponent } from '../story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '../story-card-teaser/story-card-teaser-skeleton.component';
import { JsonPipe } from '@angular/common';

@Component({
	selector: 'cuentoneta-highlighted-stories-card-deck',
	imports: [StoryCardTeaserComponent, StoryCardTeaserSkeletonComponent],
	template: `
		<div class="flex content-between items-center gap-4 text-gray-500">
			<hr class="w-6" />
			<h2 class="h3 text-center font-source-serif italic">Curaduría de la semana</h2>
			<hr class="flex-grow" />
		</div>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
			@defer (when stories().length > 0) {
				@let highlightedStory = stories()[0];
				<cuentoneta-story-card-teaser
					[story]="highlightedStory"
					[showAuthor]="true"
					[showExcerpt]="true"
					[excerptLines]="6"
					[navigationParams]="{
						navigation: 'author',
						navigationSlug: highlightedStory.author.slug,
					}"
				/>
				<div class="md:grid-rows:2 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
					@for (story of stories().slice(1); track $index) {
						<cuentoneta-story-card-teaser
							[story]="story"
							[showAuthor]="true"
							[showExcerpt]="false"
							[navigationParams]="{
								navigation: 'author',
								navigationSlug: story.author.slug,
							}"
						/>
					}
				</div>
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(6); track $index) {
					<cuentoneta-story-card-teaser-skeleton [showAuthor]="true" data-testid="skeleton" />
				}
			}
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		.deck {
			grid-template-areas:
				'highlighted others others others'
				'highlighted others others others';
		}
	`,
})
export class HighlightedStoriesCardDeckComponent {
	readonly stories = input<StoryTeaserWithAuthor[]>([]);
}
