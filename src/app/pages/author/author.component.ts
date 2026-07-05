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

// Services
import { AuthorApi } from '../../providers/author-api.interface';
import { StoryApi } from '../../providers/story-api.interface';

// Componentes
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '@components/resource/resource.component';
import { progressiveRxResource, ssrBlockingRxResource } from '@utils/ssr-resource';
import { StoryCardTeaserComponent } from '@components/story-card-teaser/story-card-teaser.component';
import Tab from '@components/tabs/tab.component';
import Tabs from '@components/tabs/tabs.component';
import { StoryCardTeaserSkeletonComponent } from '@components/story-card-teaser/story-card-teaser-skeleton.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

// Pipes
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
	selector: 'cuentoneta-author',
	imports: [
		NgOptimizedImage,
		PortableTextParserComponent,
		StoryCardTeaserComponent,
		Tab,
		Tabs,
		InitialsPipe,
		ResourceComponent,
		SkeletonComponent,
		StoryCardTeaserSkeletonComponent,
	],
	providers: [{ provide: AUTHOR_HOST, useExisting: forwardRef(() => AuthorComponent) }],
	hostDirectives: [AuthorMetaTagsDirective, AuthorStructuredDataDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
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
						<cuentoneta-skeleton appearance="square" class="h-[88px] w-[88px] rounded-xl bg-neutral-300" />
						<div class="flex flex-col gap-2">
							<cuentoneta-skeleton appearance="line" class="h-6 w-[160px] bg-neutral-300" />
							<span class="flex items-center gap-2">
								<cuentoneta-skeleton appearance="line" class="h-[18px] w-5 bg-neutral-300" />
								<cuentoneta-skeleton appearance="line" class="h-[18px] w-[100px] bg-neutral-300" />
							</span>
							<cuentoneta-skeleton appearance="line" class="h-4 w-20 bg-neutral-300" />
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
									<div class="flex flex-col gap-2">
										@for (line of biographySkeletonLines; track $index) {
											<cuentoneta-skeleton appearance="line" class="h-[25px] w-full bg-neutral-300" />
										}
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

	// Cantidad de líneas del skeleton de la biografía mientras carga
	protected readonly biographySkeletonLines = Array.from({ length: 10 });

	// Providers
	private authorService = inject(AuthorApi);
	private storyService = inject(StoryApi);
	private router = inject(Router);

	// Recursos
	protected readonly authorResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.authorService.getBySlug(params),
		defaultValue: undefined,
	});
	protected readonly storiesResource = progressiveRxResource({
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
