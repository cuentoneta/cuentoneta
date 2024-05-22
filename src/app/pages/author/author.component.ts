import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { switchMap } from 'rxjs';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { AuthorService } from '../../providers/author.service';
import { PortableTextParserComponent } from '../../components/portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../../components/resource/resource.component';

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
	template: `<article class="grid grid-cols-1 gap-8">
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
					<a [routerLink]="['/story', story.slug]">
						<cuentoneta-story-card [story]="story"></cuentoneta-story-card>
					</a>
				}
			}
		</section>
	</article>`,
	styles: ``,
})
export class AuthorComponent {
	private activatedRoute = inject(ActivatedRoute);
	private authorService = inject(AuthorService);
	private storyService = inject(StoryService);

	author$ = this.activatedRoute.params.pipe(switchMap(({ slug }) => this.authorService.getBySlug(slug)));
	stories$ = this.activatedRoute.params.pipe(switchMap(({ slug }) => this.storyService.getByAuthorSlug(slug)));

	constructor() {
		this.stories$.subscribe((stories) => console.log(stories));
	}
}
