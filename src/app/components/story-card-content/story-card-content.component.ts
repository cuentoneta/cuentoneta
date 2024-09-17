import { Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { StoryPreview } from '@models/story.model';
import { RouterLink, UrlTree } from '@angular/router';
import { AppRoutes } from '../../app.routes';
import { AuthorTeaserComponent } from '../author-teaser/author-teaser.component';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';

@Component({
	selector: 'cuentoneta-story-card-content',
	standalone: true,
	imports: [
		CommonModule,
		StoryEditionDateLabelComponent,
		PortableTextParserComponent,
		NgOptimizedImage,
		RouterLink,
		AuthorTeaserComponent,
		MediaResourceTagsComponent,
	],
	template: `
		<a
			[routerLink]="['/', appRoutes.Story, story().slug]"
			[queryParams]="navigationLink()?.queryParams"
			class="mb-2 flex flex-col gap-2 md:mb-4 md:gap-4"
		>
			<header [lang]="story().language" class="card-header">
				@if (headerText()) {
					<cuentoneta-story-edition-date-label [label]="headerText()" />
				}
			</header>
			<section [lang]="story().language">
				<h1 class="inter-body-xl-bold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ story().title }}</h1>
				<cuentoneta-portable-text-parser
					[type]="'span'"
					[paragraphs]="story().paragraphs"
					class="sm:source-serif-pro-body-base hidden sm:relative sm:line-clamp-3 sm:min-h-18 sm:text-ellipsis sm:text-justify"
				></cuentoneta-portable-text-parser>
			</section>
			<div class="flex h-4 items-center justify-between">
				<time class="inter-body-xs-semibold font-semibold text-gray-600">
					{{ story().approximateReadingTime }} minutos de lectura
				</time>
				@if (!story().author) {
					<div>
						<cuentoneta-media-resource-tags [resources]="story().media" size="lg" />
					</div>
				}
			</div>
		</a>
		@if (story().author) {
			<div class="flex flex-col gap-2 md:gap-4">
				<hr class="text-gray-300" />
				<footer class="flex flex-row items-center justify-between">
					<cuentoneta-author-teaser [author]="story().author" />
					<cuentoneta-media-resource-tags [resources]="story().media" size="lg" />
				</footer>
			</div>
		}
	`,
})
export class StoryCardContentComponent {
	story = input.required<StoryPreview>();
	headerText = input<string>();
	navigationLink = input<UrlTree>();

	protected readonly appRoutes = AppRoutes;
}
