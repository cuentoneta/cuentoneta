// Core
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, UrlTree } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

// Routing
import { AppRoutes } from '../../app.routes';

// 3rd party modules
import { injectParams } from 'ngxtension/inject-params';

// Modelos
import { Author } from '@models/author.model';
import { StoryTeaser } from '@models/story.model';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Environment
import { environment } from '../../environments/environment';

// 3rd Party Modules
import { NgxSkeletonLoaderComponent, NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Services
import { AuthorService } from '../../providers/author.service';
import { StoryService } from '../../providers/story.service';
import { ThemeService } from '../../providers/theme.service';

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
	hostDirectives: [MetaTagsDirective],
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
								<h1 class="inter-body-xl font-bold">
									<span class="hidden sm:inline">{{ author.name }}</span>
									<span class="sm:hidden">{{ author.name | initials }}</span>
								</h1>
								<span class="inter-body-sm flex items-center gap-2 font-medium text-gray-600">
									<img [ngSrc]="authorFlagUrl()" width="20" height="15" class="h-[15px] w-5 rounded" alt="" />
									{{ author.nationality.country }}
								</span>

								<div class="flex">
									<div class="rounded bg-gray-200 px-2 py-0.5 hover:cursor-default">
										<span class="inter-body-xs-semibold flex items-center gap-1">{{ stories().length }} historias</span>
									</div>
								</div>
							</div>
						</section>
					}
				} @placeholder (minimum 500ms) {
					<section class="flex items-center gap-4">
						<ngx-skeleton-loader
							[theme]="{ background: skeletonColor, margin: 0 }"
							count="1"
							appearance="square"
							size="88"
						/>
						<div class="flex flex-col gap-2">
							<ngx-skeleton-loader
								[theme]="{ background: skeletonColor, margin: 0, width: '160px', height: '24px' }"
								count="1"
								appearance="line"
							/>
							<span class="flex items-center gap-2">
								<ngx-skeleton-loader
									[theme]="{ background: skeletonColor, margin: 0, width: '20px', height: '18px' }"
									count="1"
									appearance="line"
								/>
								<ngx-skeleton-loader
									[theme]="{ background: skeletonColor, margin: 0, width: '100px', height: '18px' }"
									count="1"
									appearance="line"
								/>
							</span>
							<ngx-skeleton-loader
								[theme]="{ background: skeletonColor, margin: 0, width: '80px' }"
								count="1"
								appearance="line"
							/>
						</div>
					</section>
				}

				@if (author(); as author) {
					<cuentoneta-tabs class="w-full">
						<cuentoneta-tab title="Biografía">
							<div>
								@defer (when authorResource.hasValue()) {
									<div class="flex flex-col gap-4">
										<cuentoneta-portable-text-parser
											[paragraphs]="author.biography"
											[classes]="'source-serif-pro-body-xl leading-8'"
										/>
										@if (author.resources && author.resources.length > 0) {
											<hr class="text-gray-500" />
											<div class="font-inter font-semibold text-gray-600">Recursos web sobre el autor:</div>
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
												'background-color': skeletonColor,
											}"
											count="10"
											appearance="line"
										/>
									</div>
								}
							</div>
						</cuentoneta-tab>
						<cuentoneta-tab title="Textos">
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
					</cuentoneta-tabs>
				}
			</article>
		</main>
	`,
})
export default class AuthorComponent {
	private readonly appRoutes = AppRoutes;

	// Providers
	private params = injectParams();
	private authorService = inject(AuthorService);
	private storyService = inject(StoryService);
	private router = inject(Router);

	// Directives
	private metaTagsDirective = inject(MetaTagsDirective);

	// Recursos
	readonly authorResource = rxResource({
		params: () => this.params(),
		stream: ({ params }) =>
			this.author$(params['slug']).pipe(
				tap((author) => {
					this.updateMetaTags(author);
				}),
			),
		defaultValue: undefined,
	});
	readonly storiesResource = rxResource({
		params: () => this.params(),
		stream: ({ params }) => this.stories$(params['slug']),
		defaultValue: [],
	});

	// Propiedades
	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
	readonly author = computed(() => this.authorResource.value());
	readonly stories = computed(() => this.storiesResource.value());
	readonly authorImageUrl = computed(() =>
		this.author()?.imageUrl ? `${this.author()?.imageUrl}?auto=format` : 'assets/img/default-avatar.jpg',
	);
	readonly authorFlagUrl = computed(() => `${this.author()?.nationality.flag}?auto=format`);

	private updateMetaTags(author: Author) {
		this.metaTagsDirective.setTitle(`${author.name}`);
		this.metaTagsDirective.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}/author/${author.slug}`);
		this.metaTagsDirective.setRobots('index, follow');
		this.metaTagsDirective.setKeywords(['escritor', 'poemas', 'cuentos', 'autor', author.name.toLowerCase()]);
	}
	private author$(slug: string) {
		return this.authorService.getBySlug(slug).pipe(
			tap((author) => {
				this.updateMetaTags(author);
			}),
		);
	}

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
