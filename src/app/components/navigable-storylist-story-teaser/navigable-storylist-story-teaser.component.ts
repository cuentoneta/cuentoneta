import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutes } from '../../app.routes';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { RouterLink } from '@angular/router';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import { StorylistStoriesNavigationTeasers } from '@models/storylist.model';

@Component({
	selector: 'cuentoneta-navigable-storylist-story-teaser',
	imports: [CommonModule, MediaResourceTagsComponent, StoryEditionDateLabelComponent, RouterLink],
	changeDetection: ChangeDetectionStrategy.OnPush,
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

				<h3 class="mb-2 font-inter text-sm font-bold">{{ story().title }}</h3>
				<div class="flex items-center justify-between">
					<span class="font-inter text-sm font-normal">
						{{ story().author.name }}
					</span>
					<cuentoneta-media-resource-tags [resources]="story().media" />
				</div>
			</article>
		</a>
	`,
})
export class NavigableStorylistStoryTeaserComponent {
	public readonly story = input.required<StoryNavigationTeaserWithAuthor>();
	public readonly selected = input<boolean>();
	public readonly storylist = input.required<StorylistStoriesNavigationTeasers>();
	protected readonly appRoutes = AppRoutes;
}
