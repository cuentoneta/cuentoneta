import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutes } from '../../app.routes';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { RouterLink } from '@angular/router';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import { StorylistStoriesNavigationTeasers } from '@models/storylist.model';

@Component({
	selector: 'cuentoneta-navigable-storylist-story-teaser',
	imports: [
		CommonModule,
		MediaResourceTagsComponent,
		NgxSkeletonLoaderModule,
		StoryEditionDateLabelComponent,
		RouterLink,
	],
	template: `
		<a
			[routerLink]="['/', appRoutes.Story, story().slug]"
			[queryParams]="{ navigation: 'storylist', navigationSlug: storylist().slug }"
		>
			<article
				[ngClass]="{
					'border-l-4 border-solid border-brand-400 bg-brand-100': selected(),
				}"
				class="bg-neutral-50 px-7 py-5"
			>
				@if (story().originalPublication) {
					<cuentoneta-story-edition-date-label [label]="story().originalPublication" />
				}

				<h1 class="mb-2 font-inter text-sm font-bold">{{ story().title }}</h1>
				<div class="flex items-center justify-between">
					<h2 class="font-inter text-sm font-normal">
						{{ story().author.name }}
					</h2>
					<cuentoneta-media-resource-tags [resources]="story().media" />
				</div>
			</article>
		</a>
	`,
})
export class NavigableStorylistStoryTeaserComponent {
	readonly story = input.required<StoryNavigationTeaserWithAuthor>();
	readonly selected = input<boolean>();
	readonly storylist = input.required<StorylistStoriesNavigationTeasers>();
	protected readonly appRoutes = AppRoutes;
}
