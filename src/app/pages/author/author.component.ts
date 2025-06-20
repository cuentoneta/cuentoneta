// Core
import { Component, computed, inject } from '@angular/core';
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
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Services
import { AuthorService } from '../../providers/author.service';
import { StoryService } from '../../providers/story.service';

// Componentes
import { AuthorSkeletonComponent } from './author-skeleton.component';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../../components/resource/resource.component';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
	selector: 'cuentoneta-author',
	imports: [
    StoryCardComponent,
    NgOptimizedImage,
    PortableTextParserComponent,
    ResourceComponent,
    NgxSkeletonLoaderModule,
    AuthorSkeletonComponent
],
	hostDirectives: [MetaTagsDirective],
	template: `
		<main class="content vertical-layout-spacing horizontal-layout-spacing">
			<article class="grid grid-cols-1 gap-8">
				@if (author(); as author) {
					<section class="flex flex-col items-center gap-4">
						<img
							[ngSrc]="authorImageUrl()"
							[alt]="'Retrato de ' + author.name"
							class="h-[192px] rounded-xl"
							width="192"
							height="192"
						/>
						<div class="flex items-center gap-4">
							<h1 class="h1">{{ author.name }}</h1>
							<img [ngSrc]="authorFlagUrl()" width="30" height="20" class="h-6 w-8" alt="" />
						</div>
						@if (author.resources && author.resources.length > 0) {
							<div class="flex justify-start gap-4 sm:justify-end">
								@for (resource of author.resources; track $index) {
									<cuentoneta-resource [resource]="resource" />
								}
							</div>
						}
						<cuentoneta-portable-text-parser
							[paragraphs]="author.biography!"
							[classes]="'source-serif-pro-body-xl mb-8 leading-8'"
						/>
					</section>
					<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
						@for (story of stories(); track $index) {
							<cuentoneta-story-card [story]="story" [navigationRoute]="story.navigationRoute" />
						}
					</section>
				} @else {
					<cuentoneta-author-skeleton />
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
		request: () => this.params(),
		loader: (params) =>
			this.author$(params.request['slug']).pipe(
				tap((author) => {
					this.updateMetaTags(author);
				}),
			),
	});
	readonly storiesResource = rxResource({
		request: () => this.params(),
		loader: (params) => this.stories$(params.request['slug']),
	});

	// Propiedades
	readonly author = computed(() => this.authorResource.value());
	readonly stories = computed(() => this.storiesResource.value());
	readonly authorImageUrl = computed(() =>
		this.author()?.imageUrl ? `${this.author()?.imageUrl}?auto=format` : 'assets/img/default-avatar.jpg',
	);
	readonly authorFlagUrl = computed(() => `${this.author()?.nationality.flag}?auto=format`);

	private updateMetaTags(author: Author) {
		this.metaTagsDirective.setTitle(`${author.name}`);
		this.metaTagsDirective.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
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
