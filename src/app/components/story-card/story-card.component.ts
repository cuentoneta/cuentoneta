import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCard } from '@models/story.model';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { APP_ROUTE_TREE } from '../../app.routes';
import { Router } from '@angular/router';

@Component({
	selector: 'cuentoneta-story-card',
	standalone: true,
	imports: [CommonModule, StoryCardContentComponent, StoryCardSkeletonComponent],
	template: `
		<article class="card border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:p-8">
			<cuentoneta-story-card-content
				[story]="story()"
				[headerText]="headerText()"
				[navigationLink]="navigationLink()"
			/>
		</article>
	`,
	styles: ``,
})
export class StoryCardComponent {
	story = input.required<StoryCard>();
	headerText = computed(() => this.story().originalPublication ?? '');
	navigationLink = computed(() => this.router.createUrlTree(['/', this.appRouteTree['STORY'], this.story().slug]));

	private readonly appRouteTree = APP_ROUTE_TREE;
	private router = inject(Router);
}
