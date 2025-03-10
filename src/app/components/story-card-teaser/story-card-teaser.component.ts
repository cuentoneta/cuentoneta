import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import { RouterLink } from '@angular/router';
import { StoryCardTeaserSkeletonComponent } from './story-card-teaser-skeleton.component';
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'cuentoneta-story-card-teaser',
	imports: [CommonModule, NgOptimizedImage, RouterLink, StoryCardTeaserSkeletonComponent],
	template: `<article class="flex gap-4">
		@if (story(); as story) {
			<article class="flex gap-4">
				@if (order()) {
					<span class="source-serif-pro-heading-2-bold leading-none text-primary-500">{{ formattedOrder() }}.</span>
				}
				<div class="flex flex-1 flex-col gap-1">
					@if (showAuthor()) {
						<a [routerLink]="['/', appRoutes.Author, story.author.slug]" class="flex items-center gap-2">
							<img
								[ngSrc]="story.author.imageUrl"
								[alt]="'Retrato de ' + story.author.name"
								width="24"
								height="24"
								class="h-6 w-6 rounded-full"
							/>
							<span class="inter-body-sm-semibold text-gray-500">{{ story.author.name }}</span>
						</a>
					}
					<a
						[routerLink]="['/', appRoutes.Story, story.slug]"
						[queryParams]="navigationParams()"
						class="flex flex-col gap-1"
					>
						<header class="inter-body-xl-bold">
							{{ story.title }}
						</header>
						<footer class="inter-body-xs flex gap-1 text-gray-500">
							<span> {{ story.approximateReadingTime }} minutos de lectura </span>
							<span>•</span>
							<span> Leer -> </span>
						</footer>
					</a>
				</div>
			</article>
		} @else {
			<cuentoneta-story-card-teaser-skeleton [order]="order()" [showAuthor]="showAuthor()" data-testid="skeleton" />
		}
	</article> `,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserComponent {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	story = input<StoryNavigationTeaserWithAuthor>();
	order = input<number>();
	showAuthor = input<boolean>(false);
	navigationParams = input<{ navigation: string; navigationSlug: string }>();

	// Propiedades
	formattedOrder = computed(() => {
		const order = this.order();
		return order && order >= 10 ? order : `0${order}`;
	});
}
