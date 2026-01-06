import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { StoryNavigationTeaserWithAuthor, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { RouterLink } from '@angular/router';
import { StoryCardTeaserSkeletonComponent } from './story-card-teaser-skeleton.component';
import { AppRoutes } from '../../app.routes';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-story-card-teaser',
	imports: [NgOptimizedImage, RouterLink, StoryCardTeaserSkeletonComponent, PortableTextParserComponent],
	template: `
		@if (story(); as story) {
			<article class="flex gap-4">
				@if (order()) {
					<span class="source-serif-2-5xl font-bold leading-none text-brand-500">{{ formattedOrder() }}.</span>
				}
				<div class="flex flex-1 flex-col">
					@if (showAuthor() && 'author' in story) {
						<a [routerLink]="['/', appRoutes.Author, story.author.slug]" class="flex items-center gap-2">
							<img
								[ngSrc]="authorImageUrl()"
								[alt]="'Retrato de ' + story.author.name"
								width="20"
								height="20"
								class="h-5 w-5 rounded-full"
							/>
							<span class="font-inter text-sm font-semibold text-neutral-500">{{ story.author.name }}</span>
						</a>
					}
					<a
						[routerLink]="['/', appRoutes.Story, story.slug]"
						[queryParams]="navigationParams()"
						[class]="showExcerpt() ? 'gap-2' : 'gap-1'"
						class="grid h-full grid-rows-[auto_auto_auto]"
					>
						<header class="line-clamp-2 font-inter text-xl font-bold">
							{{ story.title }}
						</header>
						@if (showExcerpt() && story.paragraphs.length > 0) {
							<cuentoneta-portable-text-parser
								[paragraphs]="story.paragraphs"
								[class]="'line-clamp-' + excerptLines()"
								data-testid="portable-text-parser"
								class="source-serif-xl min-h-18 relative text-ellipsis text-justify font-normal"
							/>
						}
						<footer class="flex gap-1 font-inter text-xs text-neutral-500">
							<span> {{ story.approximateReadingTime }} minutos de lectura </span>
							<span>•</span>
							<span> Leer -> </span>
						</footer>
					</a>
				</div>
			</article>
		} @else {
			<cuentoneta-story-card-teaser-skeleton
				[order]="order()"
				[showAuthor]="showAuthor()"
				[showExcerpt]="showExcerpt()"
				[excerptLines]="excerptLines()"
				data-testid="skeleton"
			/>
		}
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserComponent {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	readonly story = input<StoryNavigationTeaserWithAuthor | StoryTeaserWithAuthor | StoryTeaser>();
	readonly order = input<number>();
	readonly showAuthor = input<boolean>(false);
	readonly showExcerpt = input<boolean>(false);
	readonly excerptLines = input<number>(3);
	readonly navigationParams = input<{ navigation: string; navigationSlug: string }>();
	readonly authorImageUrl = computed(() => {
		const story = this.story();
		if (story && 'author' in story) {
			return `${story.author.imageUrl}?h=64&w=64`;
		}
		return '';
	});

	// Propiedades
	readonly formattedOrder = computed(() => {
		const order = this.order();
		return order && order >= 10 ? order : `0${order}`;
	});
}
