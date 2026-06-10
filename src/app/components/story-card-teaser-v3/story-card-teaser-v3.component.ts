import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { StoryNavigationTeaserWithAuthor, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { AppRoutes } from '../../app.routes';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import {
	StoryMediaSelectorsComponent,
	StoryMediaSelectorsTheme,
} from '../story-media-selectors/story-media-selectors.component';

/**
 * Variantes visuales del componente StoryCardTeaser definidas en el Design System v3.
 *
 * - `on-white`: layout horizontal con imagen a la izquierda, pensado para fondos blancos.
 * - `on-gray`: idéntico a `on-white` pero con los selectores de multimedia en blanco, para fondos grises.
 * - `highlighted`: tarjeta destacada con borde y fondo, con la imagen a la derecha.
 * - `compact`: layout vertical angosto con la imagen, numeración y multimedia apiladas.
 */
export type StoryCardTeaserV3Variant = 'on-white' | 'on-gray' | 'highlighted' | 'compact';

@Component({
	selector: 'cuentoneta-story-card-teaser-v3',
	imports: [NgOptimizedImage, NgTemplateOutlet, RouterLink, PortableTextParserComponent, StoryMediaSelectorsComponent],
	template: `
		@if (story(); as story) {
			@switch (variant()) {
				@case ('compact') {
					<article class="flex w-full max-w-[395px] flex-col items-center gap-4">
						<div
							class="relative flex w-full items-center justify-center rounded-xl bg-neutral-100 py-5"
							data-testid="cover-container"
						>
							<a [routerLink]="storyRouterLink()" [queryParams]="navigationParams()">
								<ng-container [ngTemplateOutlet]="cover" />
							</a>
							@if (order()) {
								<span class="source-serif-4xl absolute top-5 left-[22px] font-bold text-brand-500" data-testid="order">
									{{ order() }}
								</span>
							}
							@if (showMultimedia() && story.media.length > 0) {
								<div class="absolute top-5 right-[18px]">
									<cuentoneta-story-media-selectors
										[media]="story.media"
										theme="solid"
										orientation="vertical"
										data-testid="media"
									/>
								</div>
							}
						</div>
						<div class="flex w-full flex-col gap-1">
							@if (showAuthor() && 'author' in story) {
								<ng-container [ngTemplateOutlet]="authorContainer" [ngTemplateOutletContext]="{ $implicit: story }" />
							}
							<a
								[routerLink]="storyRouterLink()"
								[queryParams]="navigationParams()"
								class="truncate font-inter text-lg font-bold text-neutral-900"
							>
								{{ story.title }}
							</a>
							<ng-container [ngTemplateOutlet]="readingTime" [ngTemplateOutletContext]="{ $implicit: story }" />
						</div>
					</article>
				}
				@default {
					<article [class]="rowWrapperClasses()">
						@if (variant() !== 'highlighted') {
							<a [routerLink]="storyRouterLink()" [queryParams]="navigationParams()" class="shrink-0">
								<ng-container [ngTemplateOutlet]="cover" />
							</a>
						}
						<div [class]="rowColumnClasses()">
							@if (showAuthor() && 'author' in story) {
								<ng-container [ngTemplateOutlet]="authorContainer" [ngTemplateOutletContext]="{ $implicit: story }" />
							}
							<div class="flex w-full flex-col gap-2">
								<a
									[routerLink]="storyRouterLink()"
									[queryParams]="navigationParams()"
									class="flex w-full flex-col gap-1"
								>
									<p class="line-clamp-2 font-inter text-xl font-bold text-neutral-900">
										@if (order()) {
											<span class="source-serif-2-5xl font-bold text-brand-500">{{ order() }}. </span>
										}
										<span>{{ story.title }}</span>
									</p>
									@if (showDescription() && story.paragraphs.length > 0) {
										<cuentoneta-portable-text-parser
											[paragraphs]="story.paragraphs"
											[class]="'line-clamp-' + excerptLines()"
											data-testid="description"
											class="overflow-hidden font-inter text-sm font-medium text-ellipsis text-neutral-600"
										/>
									}
								</a>
								<ng-container [ngTemplateOutlet]="readingTime" [ngTemplateOutletContext]="{ $implicit: story }" />
							</div>
							@if (showMultimedia() && story.media.length > 0) {
								<cuentoneta-story-media-selectors [media]="story.media" [theme]="mediaTheme()" data-testid="media" />
							}
						</div>
						@if (variant() === 'highlighted') {
							<a [routerLink]="storyRouterLink()" [queryParams]="navigationParams()" class="shrink-0">
								<ng-container [ngTemplateOutlet]="cover" />
							</a>
						}
					</article>
				}
			}
		}

		<!-- Imagen alusiva a la historia (o placeholder mientras no haya URL disponible) -->
		<ng-template #cover>
			@if (coverImageUrl(); as url) {
				<img
					[ngSrc]="url"
					width="118"
					height="164"
					alt=""
					class="h-41 w-[118px] shrink-0 rounded-lg object-cover"
					data-testid="cover-image"
				/>
			} @else {
				<div class="h-41 w-[118px] shrink-0 rounded-lg bg-neutral-300" data-testid="cover-placeholder"></div>
			}
		</ng-template>

		<!-- Contenedor de autor con avatar y nombre -->
		<ng-template #authorContainer let-story>
			<a [routerLink]="['/', appRoutes.Author, story.author.slug]" class="flex items-center gap-2" data-testid="author">
				@if (authorImageUrl()) {
					<img
						[ngSrc]="authorImageUrl()"
						[alt]="'Retrato de ' + story.author.name"
						width="24"
						height="24"
						class="h-6 w-6 rounded-full object-cover"
					/>
				} @else {
					<div class="h-6 w-6 rounded-full bg-neutral-300"></div>
				}
				<span class="font-inter text-sm font-medium text-neutral-900">{{ story.author.name }}</span>
			</a>
		</ng-template>

		<!-- Etiqueta opcional, separador y tiempo de lectura -->
		<ng-template #readingTime let-story>
			<div class="flex items-center gap-2" data-testid="reading-time">
				@if (tagLabel()) {
					<span class="font-inter text-xs font-bold text-brand-500">{{ tagLabel() }}</span>
					<span class="font-inter text-xxs font-medium text-neutral-600">•</span>
				}
				<span class="font-inter text-xs font-medium text-neutral-600">
					{{ story.approximateReadingTime }} minutos de lectura
				</span>
			</div>
		</ng-template>
	`,
	host: {
		'[class]': '"block"',
	},
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserV3Component {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	readonly story = input<StoryNavigationTeaserWithAuthor | StoryTeaserWithAuthor | StoryTeaser>();
	readonly variant = input<StoryCardTeaserV3Variant>('on-white');
	readonly order = input<number>();
	readonly coverImageUrl = input<string>();
	readonly tagLabel = input<string>();
	readonly showAuthor = input<boolean>(false);
	readonly showDescription = input<boolean>(false);
	readonly showMultimedia = input<boolean>(false);
	readonly excerptLines = input<number>(2);
	readonly navigationParams = input<{ navigation: string; navigationSlug: string }>();

	readonly authorImageUrl = computed(() => {
		const story = this.story();
		if (story && 'author' in story && story.author.imageUrl) {
			return `${story.author.imageUrl}?h=64&w=64`;
		}
		return '';
	});

	readonly storyRouterLink = computed(() => ['/', this.appRoutes.Story, this.story()?.slug]);

	// Mapea la variante de la tarjeta al tema visual de los selectores de multimedia.
	readonly mediaTheme = computed<StoryMediaSelectorsTheme>(() => {
		switch (this.variant()) {
			case 'on-gray':
				return 'solid';
			case 'highlighted':
				return 'bordered';
			default:
				return 'subtle';
		}
	});

	readonly rowWrapperClasses = computed(() =>
		this.variant() === 'highlighted'
			? 'flex w-full max-w-[715px] items-start gap-8 overflow-hidden rounded-[16px] border border-neutral-200 bg-neutral-50 p-6'
			: 'flex w-full max-w-[715px] items-start gap-6',
	);

	readonly rowColumnClasses = computed(() => {
		const base = 'flex min-w-0 flex-1 flex-col justify-center gap-3';
		return this.variant() === 'highlighted' ? base : `${base} pt-1`;
	});
}
