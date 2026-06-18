// Core
import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';

// Routing
import { AppRoutes } from '../../app.routes';

// Modelos
import { StoryTeaser } from '@models/story.model';

// SEO
import { AuthorMetaTagsDirective } from './author-meta-tags.directive';
import { AuthorStructuredDataDirective } from './author-structured-data.directive';
import { AUTHOR_HOST, type AuthorHost } from './author-host';

// 3rd Party Modules
import { NgxSkeletonLoaderComponent, NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Services
import { AuthorApi } from '../../providers/author-api.interface';
import { StoryApi } from '../../providers/story-api.interface';

// Componentes
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '@components/resource/resource.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { StoryCardTeaserComponent } from '@components/story-card-teaser/story-card-teaser.component';
import Tab from '@components/tabs/tab.component';
import Tabs from '@components/tabs/tabs.component';
import { StoryCardTeaserSkeletonComponent } from '@components/story-card-teaser/story-card-teaser-skeleton.component';

// Pipes
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
	selector: 'cuentoneta-author',
	imports: [
		NgOptimizedImage,
		PortableTextParserComponent,
		NgxSkeletonLoaderModule,
		StoryCardTeaserComponent,
		Tab,
		Tabs,
		InitialsPipe,
		ResourceComponent,
		NgxSkeletonLoaderComponent,
		StoryCardTeaserSkeletonComponent,
	],
	providers: [{ provide: AUTHOR_HOST, useExisting: forwardRef(() => AuthorComponent) }],
	hostDirectives: [AuthorMetaTagsDirective, AuthorStructuredDataDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		@reference '#tailwind-theme';

		:host ::ng-deep .author-image-skeleton .skeleton-loader,
		:host ::ng-deep .author-name-skeleton .skeleton-loader,
		:host ::ng-deep .author-flag-skeleton .skeleton-loader,
		:host ::ng-deep .author-nationality-skeleton .skeleton-loader,
		:host ::ng-deep .author-stories-count-skeleton .skeleton-loader,
		:host ::ng-deep .biography-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
	template: `
		<main class="content vertical-layout-spacing horizontal-layout-spacing">
			<article class="grid grid-cols-1 gap-8">
				@defer (when authorResource.hasValue()) {
					@if (author(); as author) {
						<section class="flex items-center gap-4">
							<img
								[ngSrc]="authorImageUrl()"
								[alt]="'Retrato de ' + author.name"
								class="h-[88px] rounded-xl"
								width="88"
								height="88"
							/>
							<div class="flex flex-col gap-2">
								<h1 class="font-inter text-xl font-bold">
									<span class="hidden sm:inline">{{ author.name }}</span>
									<span class="sm:hidden">{{ author.name | initials }}</span>
								</h1>
								<span class="flex items-center gap-2 font-inter text-sm font-medium text-neutral-600">
									<img [ngSrc]="authorFlagUrl()" width="20" height="15" class="h-[15px] w-5 rounded" alt="" />
									{{ author.nationality.country }}
								</span>

								<div class="flex">
									<div class="rounded bg-neutral-200 px-2 py-0.5 hover:cursor-default">
										<span class="flex items-center gap-1 font-inter text-xs font-semibold"
											>{{ stories().length }} historias</span
										>
									</div>
								</div>
							</div>
						</section>
					}
				} @placeholder (minimum 500ms) {
					<section class="flex items-center gap-4">
						<ngx-skeleton-loader
							[theme]="{ margin: 0 }"
							count="1"
							appearance="square"
							size="88"
							class="author-image-skeleton"
						/>
						<div class="flex flex-col gap-2">
							<ngx-skeleton-loader
								[theme]="{ margin: 0, width: '160px', height: '24px' }"
								count="1"
								appearance="line"
								class="author-name-skeleton"
							/>
							<span class="flex items-center gap-2">
								<ngx-skeleton-loader
									[theme]="{ margin: 0, width: '20px', height: '18px' }"
									count="1"
									appearance="line"
									class="author-flag-skeleton"
								/>
								<ngx-skeleton-loader
									[theme]="{ margin: 0, width: '100px', height: '18px' }"
									count="1"
									appearance="line"
									class="author-nationality-skeleton"
								/>
							</span>
							<ngx-skeleton-loader
								[theme]="{ margin: 0, width: '80px' }"
								count="1"
								appearance="line"
								class="author-stories-count-skeleton"
							/>
						</div>
					</section>
				}

				@if (author(); as author) {
					<cuentoneta-tabs [initialTab]="activeTab()" class="w-full">
						<cuentoneta-tab title="Textos" name="stories">
							<div>
								@defer (when storiesResource.hasValue()) {
									<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
										@for (story of stories(); track $index) {
											<cuentoneta-story-card-teaser
												[story]="story"
												[order]="$index + 1"
												[navigationParams]="{
													navigation: 'author',
													navigationSlug: author.slug,
												}"
											/>
										}
									</section>
								} @loading (minimum 500ms) {
									<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
										@for (_ of [].constructor(12); track $index) {
											<cuentoneta-story-card-teaser-skeleton [order]="$index + 1" data-testid="skeleton" />
										}
									</section>
								}
							</div>
						</cuentoneta-tab>
						<cuentoneta-tab title="Biografía" name="about">
							<div>
								@defer (when authorResource.hasValue()) {
									<div class="flex flex-col gap-4">
										<cuentoneta-portable-text-parser
											[paragraphs]="author.biography"
											[classes]="'source-serif-xl font-normal leading-8'"
											class="flex flex-col gap-4"
										/>
										@if (author.resources && author.resources.length > 0) {
											<hr class="text-neutral-500" />
											<div class="font-inter font-semibold text-neutral-600">Recursos web sobre el autor:</div>
											<div class="flex justify-start gap-4">
												@for (resource of author.resources; track $index) {
													<cuentoneta-resource [resource]="resource" />
												}
											</div>
										}
									</div>
								} @loading (minimum 500ms) {
									<div class="flex flex-col gap-4">
										<ngx-skeleton-loader
											[theme]="{
												'margin-bottom': '8px',
												height: '25px',
												width: '100%',
											}"
											count="10"
											appearance="line"
											class="biography-skeleton"
										/>
									</div>
								}
							</div>
						</cuentoneta-tab>
					</cuentoneta-tabs>
				}
			</article>
		</main>
	`,
})
export default class AuthorComponent implements AuthorHost {
	private readonly appRoutes = AppRoutes;

	// Route inputs
	public readonly slug = input.required<string>();
	public readonly activeTab = input<'stories' | 'about'>('stories');

	// Providers
	private authorService = inject(AuthorApi);
	private storyService = inject(StoryApi);
	private router = inject(Router);

	// Recursos
	protected readonly authorResource = rxResource({
		params: this.slug,
		stream: ({ params }) => this.authorService.getBySlug(params),
		defaultValue: undefined,
	});
	protected readonly storiesResource = rxResource({
		params: this.slug,
		stream: ({ params }) => this.stories$(params),
		defaultValue: [],
	});

	// Propiedades
	public readonly author = computed(() => this.authorResource.value());
	protected readonly stories = computed(() => this.storiesResource.value());
	protected readonly authorImageUrl = computed(() =>
		this.author()?.imageUrl ? `${this.author()?.imageUrl}?auto=format` : 'assets/img/default-avatar.jpg',
	);
	protected readonly authorFlagUrl = computed(() => `${this.author()?.nationality.flag}?auto=format`);

	private stories$(slug: string): Observable<(StoryTeaser & { navigationRoute: UrlTree })[]> {
		return this.storyService.getByAuthorSlug(slug).pipe(
			map((stories) => {
				return stories.map((story) => ({
					...story,
					navigationRoute: this.router.createUrlTree(['/', this.appRoutes.Story, story.slug], {
						queryParams: { navigation: 'author', navigationSlug: slug },
					}),
				})) as (StoryTeaser & { navigationRoute: UrlTree })[];
			}),
		);
	}
}
