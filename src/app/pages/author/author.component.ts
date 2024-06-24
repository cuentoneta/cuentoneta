import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, UrlTree } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { combineLatest, map, of, switchMap, tap } from 'rxjs';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { AuthorService } from '../../providers/author.service';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../../components/resource/resource.component';
import { StoryPreview } from '@models/story.model';
import { AppRoutes } from '../../app.routes';
import { Author } from '@models/author.model';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardSkeletonComponent } from '../../components/story-card-skeleton/story-card-skeleton.component';
import { RepeatPipe } from '../../pipes/repeat.pipe';
import { AuthorSkeletonComponent } from './author-skeleton.component';

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
					<cuentoneta-author-skeleton />
				}
			</article>
		</main>
	`,
})
export class AuthorComponent {
	private readonly appRoutes = AppRoutes;

	// Providers
	private activatedRoute = inject(ActivatedRoute);
	private authorService = inject(AuthorService);
	private storyService = inject(StoryService);
	private router = inject(Router);

	// Directives
	private metaTagsDirective = inject(MetaTagsDirective);
	public fetchContentDirective = inject(FetchContentDirective);

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
			})) as (StoryPreview & { navigationRoute: UrlTree })[];
		}),
	);

	content$ = this.fetchContentDirective.fetchContent$(combineLatest({ author: this.author$, stories: this.stories$ }));

	private updateMetaTags(author: Author) {
		this.metaTagsDirective.setTitle(`${author.name}`);
		this.metaTagsDirective.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
	}
}
