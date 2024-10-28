import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryTeaser } from '@models/story.model';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';
import { Router, UrlTree } from '@angular/router';
import { AppRoutes } from '../../app.routes';
import { CardComponent } from '../card/card.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';

@Component({
	selector: 'cuentoneta-story-card',
	standalone: true,
	template: `
		<cuentoneta-card [route]="computedRoute()" [lang]="story().language">
			<header slot="header">
				@if (headerText()) {
					<cuentoneta-story-edition-date-label [label]="headerText()" />
				}
			</header>
			<cuentoneta-story-card-content [title]="story().title" [body]="story().paragraphs" slot="content" />
			<footer slot="footer" class="flex h-4 items-center justify-between">
				<time class="inter-body-xs-semibold font-semibold text-gray-600">
					{{ story().approximateReadingTime }} minutos de lectura
				</time>
				<div>
					<cuentoneta-media-resource-tags [resources]="story().media" size="lg" />
				</div>
			</footer>
		</cuentoneta-card>
	`,
	imports: [
		CardComponent,
		CommonModule,
		MediaResourceTagsComponent,
		StoryCardContentComponent,
		StoryEditionDateLabelComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardComponent {
	story = input.required<StoryTeaser>();
	headerText = computed(() => this.story().originalPublication ?? '');
	navigationRoute = input.required<UrlTree>();
	computedRoute = computed(() => {
		return this.navigationRoute()
			? this.navigationRoute()
			: this.router.createUrlTree(['/', this.appRoutes.Story, this.story().slug]);
	});

	private readonly appRoutes = AppRoutes;
	private router = inject(Router);
}
