import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, UrlTree } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { combineLatest, delay, map, of, switchMap, tap } from 'rxjs';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { AuthorService } from '../../providers/author.service';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../../components/resource/resource.component';
import { StoryCard } from '@models/story.model';
import { AppRoutes } from '../../app.routes';
import { Author } from '@models/author.model';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardSkeletonComponent } from '../../components/story-card-skeleton/story-card-skeleton.component';
import { ThemeService } from '../../providers/theme.service';
import { RepeatPipe } from '../../pipes/repeat.pipe';

@Component({
	selector: 'cuentoneta-author',
	standalone: true,
	imports: [
		CommonModule,
		StoryCardComponent,
		NgOptimizedImage,
		PortableTextParserComponent,
		ResourceComponent,
		RouterLink,
		NgxSkeletonLoaderModule,
		StoryCardSkeletonComponent,
		RepeatPipe,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
	template: `
		<main>
			<article class="grid grid-cols-1 gap-8">
				@if (content$ | async; as content) {
					<section class="flex flex-col items-center gap-4">
						<img [ngSrc]="content.author.imageUrl" class="h-[192px] rounded-xl" width="192" height="192" />
						<div class="flex items-center gap-4">
							<h1 class="h1">{{ content.author.name }}</h1>
							<img [ngSrc]="content.author.nationality.flag" width="30" height="20" class="h-6 w-8" />
						</div>
						@if (content.author.resources && content.author.resources.length > 0) {
							<div class="flex justify-start gap-4 sm:justify-end">
								@for (resource of content.author.resources; track $index) {
									<cuentoneta-resource [resource]="resource"></cuentoneta-resource>
								}
							</div>
						}
						<cuentoneta-portable-text-parser
							[paragraphs]="content.author.biography!"
							[classes]="'source-serif-pro-body-xl mb-8 leading-8 max-w-[960px]'"
						></cuentoneta-portable-text-parser>
					</section>
					<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
						@for (story of content.stories; track $index) {
							<cuentoneta-story-card [story]="story" [navigationRoute]="story.navigationRoute"></cuentoneta-story-card>
						}
					</section>
				} @else {
					<ng-container *ngTemplateOutlet="authorSkeleton"></ng-container>
					<ng-container *ngTemplateOutlet="cardsSkeleton"></ng-container>
				}
			</article>
		</main>

		<ng-template #authorSkeleton>
			<section class="flex flex-col items-center justify-center gap-4">
				<ngx-skeleton-loader
					[theme]="{
						'height.px': 192,
						'width.px': 192,
						'background-color': skeletonColor
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
				<div class="flex items-center gap-4">
					<ngx-skeleton-loader
						[theme]="{
							'height.px': 40,
							'width.px': 320,
							'margin.px': 0,
							'background-color': skeletonColor
						}"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
					<ngx-skeleton-loader
						[theme]="{
							'height.px': 40,
							'width.px': 40,
							'margin.px': 0,
							'background-color': skeletonColor
						}"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
				</div>
				<div class="flex justify-start gap-4 sm:justify-end">
					@for (item of 3 | repeat; track $index) {
						<ngx-skeleton-loader
							[theme]="{
								'height.px': 48,
								'width.px': 48,
								'margin.px': 0,
								'background-color': skeletonColor
							}"
							count="1"
							appearance="circle"
						></ngx-skeleton-loader>
					}
				</div>
				<ngx-skeleton-loader
					[theme]="{
						'height.px': 20,
						'width.px': 768,
						'background-color': skeletonColor
					}"
					class="max-width-[960px] flex flex-col"
					count="6"
				></ngx-skeleton-loader>
			</section>
		</ng-template>
		<ng-template #cardsSkeleton>
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
				@for (item of 6 | repeat; track $index) {
					<cuentoneta-story-card-skeleton [animation]="'progress'" [displayFooter]="false" />
				}
			</section>
		</ng-template>
	`,
})
export class AuthorComponent {
	private readonly appRoutes = AppRoutes;

	// Providers
	private activatedRoute = inject(ActivatedRoute);
	private authorService = inject(AuthorService);
	private storyService = inject(StoryService);
	private router = inject(Router);
	private themeService = inject(ThemeService);

	// Directives
	private metaTagsDirective = inject(MetaTagsDirective);
	public fetchContentDirective = inject(FetchContentDirective);

	skeletonColor = this.themeService.pickColor('zinc', 300);

	author$ = this.activatedRoute.params.pipe(
		switchMap(({ slug }) => this.authorService.getBySlug(slug)),
		tap((author) => this.updateMetaTags(author)),
	);

	stories$ = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]).pipe(
		switchMap(([{ slug }, { limit, offset }]) =>
			combineLatest([of(slug as string), this.storyService.getByAuthorSlug(slug, offset, limit)]),
		),
		map(([slug, stories]) => {
			return stories.map((story) => ({
				...story,
				navigationRoute: this.router.createUrlTree(['/', this.appRoutes.Story, story.slug], {
					queryParams: { navigation: 'author', navigationSlug: slug },
				}),
			})) as (StoryCard & { navigationRoute: UrlTree })[];
		}),
	);

	content$ = this.fetchContentDirective.fetchContent$(combineLatest({ author: this.author$, stories: this.stories$ }));

	private updateMetaTags(author: Author) {
		this.metaTagsDirective.setTitle(`${author.name}`);
		this.metaTagsDirective.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
	}
}
