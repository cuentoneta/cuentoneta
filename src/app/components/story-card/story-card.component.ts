import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryPreview } from '@models/story.model';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { Router, UrlTree } from '@angular/router';
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'cuentoneta-story-card',
	standalone: true,
	imports: [CommonModule, StoryCardContentComponent, StoryCardSkeletonComponent],
	template: `
		<article class="card border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:p-8">
			<cuentoneta-story-card-content [story]="story()" [headerText]="headerText()" [navigationLink]="computedRoute()" />
		</article>
	`,
	styles: ``,
})
export class StoryCardComponent {
	story = input.required<StoryPreview>();
	headerText = computed(() => this.story().originalPublication ?? '');
	navigationRoute = input<UrlTree>();
	computedRoute = computed(() => {
		return this.navigationRoute()
			? this.navigationRoute()
			: this.router.createUrlTree(['/', this.appRoutes.Story, this.story().slug]);
	});

	private readonly appRoutes = AppRoutes;
	private router = inject(Router);
}
