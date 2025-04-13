// Core
import { Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
import { StoryCardTeaserComponent } from '../../components/story-card-teaser/story-card-teaser.component';

@Component({
	selector: 'cuentoneta-author',
	imports: [
		CommonModule,
		NgOptimizedImage,
		PortableTextParserComponent,
		ResourceComponent,
		NgxSkeletonLoaderModule,
		AuthorSkeletonComponent,
		StoryCardTeaserComponent,
	],
	hostDirectives: [MetaTagsDirective],
	template: `
		<main>
			<article class="grid grid-cols-2 gap-8">
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
									<cuentoneta-resource [resource]="resource"></cuentoneta-resource>
								}
							</div>
						}
						<cuentoneta-portable-text-parser
							[paragraphs]="author.biography!"
							[classes]="'source-serif-pro-body-xl mb-8 leading-8'"
						></cuentoneta-portable-text-parser>
					</section>
					<section class="grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-8">
						@defer (when stories().length > 0) {
							@for (story of stories(); track $index) {
								<cuentoneta-story-card-teaser
									[story]="story"
									[showAuthor]="true"
									[order]="$index + 1"
									[navigationParams]="{
										navigation: 'author',
										navigationSlug: author.slug ?? ''
									}"
								/>
							}
						} @loading (minimum 500ms) {
							@for (_ of [].constructor(6); track $index) {
								<cuentoneta-story-card-teaser [showAuthor]="true" [order]="$index + 1" />
							}
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
		loader: (params) => this.storyService.getByAuthorSlug(params.request['slug']),
	});

	// Propiedades
	author = computed(() => this.authorResource.value());
	stories = computed(() => this.storiesResource.value() ?? []);
	authorImageUrl = computed(() =>
		this.author()?.imageUrl ? `${this.author()?.imageUrl}?auto=format` : 'assets/img/default-avatar.jpg',
	);
	authorFlagUrl = computed(() => `${this.author()?.nationality.flag}?auto=format`);

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
}
