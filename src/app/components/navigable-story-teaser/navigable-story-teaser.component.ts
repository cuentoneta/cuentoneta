import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryBase } from '@models/story.model';
import { AppRoutes } from '../../app.routes';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'cuentoneta-navigable-story-teaser',
	standalone: true,
	imports: [
		CommonModule,
		MediaResourceTagsComponent,
		NgxSkeletonLoaderModule,
		StoryEditionDateLabelComponent,
		RouterLink,
	],
	template: `
		@if (story()) {
			<a
				[routerLink]="['/', appRoutes.Story, story().slug]"
				[queryParams]="{ navigation: 'author', navigationSlug: authorSlug() }"
			>
				<article
					[ngClass]="{
						'border-l-4 border-solid border-primary-400 bg-primary-100': selected()
					}"
					class="bg-gray-50 px-7 py-5"
				>
					@if (story().originalPublication) {
						<cuentoneta-story-edition-date-label [label]="story().originalPublication" />
					}

					<h4 class="inter-body-sm-bold mb-2">{{ story().title }}</h4>
					<div class="flex items-center justify-between">
						<time class="inter-body-xs-semibold font-semibold text-gray-600">
							{{ story().approximateReadingTime }} minutos de lectura
						</time>
						<cuentoneta-media-resource-tags [resources]="story().media" />
					</div>
				</article>
			</a>
		}
	`,
})
export class NavigableStoryTeaserComponent {
	story = input.required<StoryBase>();
	selected = input<boolean>();
	authorSlug = input.required<string>();
	protected readonly appRoutes = AppRoutes;
}
