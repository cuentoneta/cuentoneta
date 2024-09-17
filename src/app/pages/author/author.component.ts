// Core
import { Component, effect, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Params, Router, RouterLink, UrlTree } from '@angular/router';
import { combineLatest, map, Observable, tap } from 'rxjs';

// Routing
import { AppRoutes } from '../../app.routes';

// 3rd party modules
import { injectParams } from 'ngxtension/inject-params';

// Modelos
import { Author } from '@models/author.model';
import { StoryTeaser } from '@models/story.model';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardSkeletonComponent } from '../../components/story-card-skeleton/story-card-skeleton.component';
import { RepeatPipe } from '../../pipes/repeat.pipe';

// Services
import { AuthorService } from '../../providers/author.service';
import { StoryService } from '../../providers/story.service';

// Componentes
import { AuthorSkeletonComponent } from './author-skeleton.component';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../../components/resource/resource.component';
import { StoryCardComponent } from '../../components/story-card/story-card.component';

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
		AuthorSkeletonComponent,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
	template: `
		<main>
			<article class="grid grid-cols-1 gap-8">
				@if (author) {
					<section class="flex flex-col items-center gap-4">
						<img [ngSrc]="author.imageUrl" class="h-[192px] rounded-xl" width="192" height="192" />
						<div class="flex items-center gap-4">
							<h1 class="h1">{{ author.name }}</h1>
							<img [ngSrc]="author.nationality.flag" width="30" height="20" class="h-6 w-8" />
						</div>
						@if (author.resources && author.resources.length > 0) {
							<div class="flex justify-start gap-4 sm:justify-end">
								@for (resource of author.resources; track $index) {
									<cuentoneta-resource [resource]="resource"></cuentoneta-resource>
								}
							</div>
						}
						<cuentoneta-portable-text-parser
							[paragraphs]="author.biography!"
							[classes]="'source-serif-pro-body-xl mb-8 leading-8 max-w-[960px]'"
						></cuentoneta-portable-text-parser>
					</section>
					<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
						@for (story of stories; track $index) {
							<cuentoneta-story-card [story]="story" [navigationRoute]="story.navigationRoute"></cuentoneta-story-card>
						}
					</section>
				} @else {
					<cuentoneta-author-skeleton />
				}
			</article>
		</main>
	`,
})
export class AuthorComponent {
	private readonly appRoutes = AppRoutes;

	// Providers
	private params = injectParams();
	private authorService = inject(AuthorService);
	private storyService = inject(StoryService);
	private router = inject(Router);

	// Directives
	private metaTagsDirective = inject(MetaTagsDirective);
	public fetchContentDirective = inject(FetchContentDirective);

	author: Author | undefined;
	stories: (StoryTeaser & { navigationRoute: UrlTree })[] = [];

	constructor() {
		effect((cleanUp) => {
			const subscription = this.content$(this.params()).subscribe(({ author, stories }) => {
				this.author = author;
				this.stories = stories;
				this.updateMetaTags(author);
			});
			cleanUp(() => subscription.unsubscribe());
		});
	}

	private updateMetaTags(author: Author) {
		this.metaTagsDirective.setTitle(`${author.name}`);
		this.metaTagsDirective.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
	}

	private content$(params: Params) {
		const { slug } = params;
		return this.fetchContentDirective.fetchContent$(
			combineLatest({ author: this.author$(slug), stories: this.stories$(slug) }),
		);
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
