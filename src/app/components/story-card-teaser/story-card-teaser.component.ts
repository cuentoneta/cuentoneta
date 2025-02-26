import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import { RouterLink } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-story-card-teaser',
	imports: [CommonModule, NgOptimizedImage, RouterLink, NgxSkeletonLoaderModule],
	template: `<article class="flex gap-4">
		@if (story(); as story) {
			@if (order()) {
				<span class="source-serif-pro-heading-2-bold leading-none text-primary-500">{{ formattedOrder() }}.</span>
			}
			<div class="flex flex-1 flex-col gap-1">
				@if (showAuthor()) {
					<a [routerLink]="['/', 'author', story.author.slug]" class="flex items-center gap-2">
						<img [ngSrc]="story.author.imageUrl" width="24" height="24" class="h-6 w-6 rounded-full" />
						<span class="inter-body-sm-semibold text-gray-500">{{ story.author.name }}</span>
					</a>
				}
				<a [routerLink]="['/', 'story', story.slug]" [queryParams]="navigationParams()" class="flex flex-col gap-1">
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
		} @else {
			@if (order()) {
				<ngx-skeleton-loader
					[theme]="{
						height: '36px',
						'margin-bottom': 0,
						width: '40px'
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
			}
			<div class="flex flex-1 flex-col  gap-1">
				@if (showAuthor()) {
					<div class="flex items-center gap-2">
						<ngx-skeleton-loader
							[theme]="{
								height: '24px',
								margin: 0,
								width: '24px'
							}"
							count="1"
							appearance="circle"
							class="flex items-center"
						></ngx-skeleton-loader>
						<ngx-skeleton-loader
							[theme]="{
								height: '20px',
								'margin-bottom': 0
							}"
							class="w-full"
							count="1"
							appearance="line"
						></ngx-skeleton-loader>
					</div>
				}
				<div class="flex flex-col gap-1">
					<ngx-skeleton-loader
						[theme]="{
							height: '28px',
							'margin-bottom': 0
						}"
						class="w-full"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
					<footer class="inter-body-xs flex gap-1 text-gray-500">
						<ngx-skeleton-loader
							[theme]="{
								height: '16px',
								'margin-bottom': 0,
								width: '120px'
							}"
							count="1"
							appearance="line"
						></ngx-skeleton-loader>
						<span>•</span>
						<ngx-skeleton-loader
							[theme]="{
								height: '16px',
								'margin-bottom': 0,
								width: '40px'
							}"
							count="1"
							appearance="line"
						></ngx-skeleton-loader>
					</footer>
				</div>
			</div>
		}
	</article>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserComponent {
	story = input<StoryNavigationTeaserWithAuthor>();
	order = input<number>();
	showAuthor = input<boolean>(false);
	navigationParams = input<{ navigation: string; navigationSlug: string }>();

	formattedOrder = computed(() => {
		const order = this.order();
		return order && order >= 10 ? order : `0${order}`;
	});
}
