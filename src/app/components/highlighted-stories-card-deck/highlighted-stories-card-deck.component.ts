import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import { StoryCardTeaserComponent } from '../story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '../story-card-teaser/story-card-teaser-skeleton.component';

@Component({
	selector: 'cuentoneta-highlighted-stories-card-deck',
	imports: [StoryCardTeaserComponent, StoryCardTeaserSkeletonComponent],
	template: `
		<div class="flex content-between items-center gap-4 text-gray-500">
			<hr class="w-6" />
			<h2 class="h3 text-center font-source-serif italic">Curaduría de la semana</h2>
			<hr class="flex-grow" />
		</div>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
			@defer (when stories().length > 0) {
				@for (story of stories(); track $index) {
					@if ($index === 0) {
						<cuentoneta-story-card-teaser
							[story]="story"
							[showAuthor]="true"
							[showExcerpt]="true"
							[navigationParams]="{
								navigation: 'author',
								navigationSlug: story.author.slug,
							}"
						/>
					} @else {
						<cuentoneta-story-card-teaser
							[story]="story"
							[showAuthor]="true"
							[navigationParams]="{
								navigation: 'author',
								navigationSlug: story.author.slug,
							}"
						/>
					}
				}
			} @loading (minimum 500ms) {
				@for (_ of [].constructor(6); track $index) {
					<cuentoneta-story-card-teaser-skeleton [showAuthor]="true" [order]="$index + 1" data-testid="skeleton" />
				}
			}
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightedStoriesCardDeckComponent {
	readonly stories = input<StoryNavigationTeaserWithAuthor[]>([]);
}
