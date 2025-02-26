import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryNavigationTeaser, StoryTeaser } from '@models/story.model';

@Component({
	selector: 'cuentoneta-story-card-teaser',
	imports: [CommonModule, NgOptimizedImage],
	template: `<article class="flex gap-4">
		@if (order() !== false) {
			<span class="inter-heading-2-semibold text-primary-500">#{{ order() }}</span>
		}
		@if (story(); as story) {
			<div class="flex flex-col gap-1">
				<header class="inter-body-xl-bold">
					@if (showAuthor()) {
						<div class="flex items-center gap-2">
							<img [ngSrc]="story.author.imageUrl" width="24" height="24" class="h-6 w-6 rounded-full" />
							<span class="inter-body-sm-semibold text-gray-500">{{ story.author.name }}</span>
						</div>
						{{ story.title }}
					}
				</header>
				<footer class="inter-body-xs flex gap-1 text-gray-500">
					<span> {{ story.approximateReadingTime }} minutos de lectura </span>
					<span>•</span>
					<span> Leer -> </span>
				</footer>
			</div>
		}
	</article>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserComponent {
	story = input<any>();
	order = input<number | false>(false);
	showAuthor = input<boolean>(false);
}
