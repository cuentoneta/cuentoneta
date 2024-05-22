import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCard } from '@models/story.model';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';

@Component({
	selector: 'cuentoneta-story-card',
	standalone: true,
	imports: [CommonModule, StoryCardContentComponent, StoryCardSkeletonComponent],
	template: `
		<article
			[attr.aria-busy]="!story"
			class="card border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:p-8"
		>
			<cuentoneta-story-card-content [story]="story()" [headerText]="headerText()"></cuentoneta-story-card-content>
		</article>
	`,
	styles: ``,
})
export class StoryCardComponent {
	story = input.required<StoryCard>();
	headerText = computed(() => this.story().originalPublication ?? '');
}
