import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, UrlTree } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { combineLatest, map, of, switchMap, tap } from 'rxjs';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { AuthorService } from '../../providers/author.service';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../../components/resource/resource.component';
import { Title } from '@angular/platform-browser';
import { StoryCard } from '@models/story.model';
import { AppRoutes } from '../../app.routes';

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
	],
	template: ` <main>
		<article class="grid grid-cols-1 gap-8">
			<section class="flex flex-col items-center gap-4">
				@if (author$ | async; as author) {
					@if (author) {
						<img [src]="author.imageUrl" class="h-[192px] rounded-xl" />
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
							[classes]="'source-serif-pro-body-xl mb-8 leading-8'"
						></cuentoneta-portable-text-parser>
					}
				}
			</section>
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
				@if (stories$ | async; as stories) {
					@for (story of stories; track $index) {
						<cuentoneta-story-card [story]="story" [navigationRoute]="story.navigationRoute"></cuentoneta-story-card>
					}
				}
			</section>
		</article>
	</main>`,
})
export class AuthorComponent {
	private readonly appRoutes = AppRoutes;

	// Providers
	private activatedRoute = inject(ActivatedRoute);
	private authorService = inject(AuthorService);
	private storyService = inject(StoryService);
	private router = inject(Router);
	private title = inject(Title);

	author$ = this.activatedRoute.params.pipe(
		switchMap(({ slug }) => this.authorService.getBySlug(slug)),
		tap((author) => this.title.setTitle(`${author.name} - Autor en La Cuentoneta`)),
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
}
