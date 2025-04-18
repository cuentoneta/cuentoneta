import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutes } from '../../app.routes';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { PublicationNavigationTeaser, StorylistPublicationsNavigationTeasers } from '@models/storylist.model';
import { RouterLink } from '@angular/router';
import { MapPublicationEditionLabelPipe } from '../../pipes/map-publication-edition-label.pipe';

@Component({
	selector: 'cuentoneta-navigable-publication-teaser',
	imports: [
		CommonModule,
		MediaResourceTagsComponent,
		NgxSkeletonLoaderModule,
		StoryEditionDateLabelComponent,
		RouterLink,
		MapPublicationEditionLabelPipe,
	],
	template: `
		<a
			[routerLink]="publication().published ? ['/', appRoutes.Story, publication().story.slug] : null"
			[queryParams]="{ navigation: 'storylist', navigationSlug: storylist().slug }"
		>
			<article
				[ngClass]="{
					'border-l-4 border-solid border-primary-400 bg-primary-100': selected()
				}"
				class="bg-gray-50 px-7 py-5"
			>
				<cuentoneta-story-edition-date-label
					[label]="
						publication().published
							? (publication() | mapPublicationEditionLabel: storylist())
							: storylist().comingNextLabel
					"
				/>
				@if (publication().published) {
					<h1 class="inter-body-sm-bold mb-2">{{ publication().story.title }}</h1>
					<div class="flex items-center justify-between">
						<h2 class="inter-body-sm-regular">
							{{ publication().story.author.name }}
						</h2>
						<cuentoneta-media-resource-tags [resources]="publication().story.media" />
					</div>
				} @else {
					<ngx-skeleton-loader count="2" appearance="line" animation="false"></ngx-skeleton-loader>
				}
			</article>
		</a>
	`,
})
export class NavigablePublicationTeaserComponent {
	publication = input.required<PublicationNavigationTeaser>();
	selected = input<boolean>();
	storylist = input.required<StorylistPublicationsNavigationTeasers>();
	protected readonly appRoutes = AppRoutes;
}
