import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Constantes
import { APP_ROUTE_TREE } from '../../app.routes';

// Modelos
import { StoryCard } from '@models/story.model';
import { Publication } from '@models/storylist.model';

// Componentes
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';

// Providers
import { Router } from '@angular/router';

@Component({
	selector: 'cuentoneta-publication-card',
	template: `
		<article
			class="card flex flex-col gap-2 border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:gap-4 md:p-8"
		>
			@if (publication().published) {
				<cuentoneta-story-card-content
					[story]="publication().story"
					[headerText]="publication().editionLabel"
					[navigationLink]="navigationLink()"
				/>
			} @else {
				<cuentoneta-story-card-skeleton
					[animation]="false"
					[displayDate]="false"
					[editionLabel]="publication().editionLabel"
					[comingNextLabel]="publication().comingNextLabel"
				/>
			}
		</article>
	`,
	standalone: true,
	imports: [CommonModule, StoryCardSkeletonComponent, StoryCardContentComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent {
	publication = input.required<Publication<StoryCard>>();
	navigationLink = computed(() =>
		this.router.createUrlTree(['/', this.appRouteTree['STORY'], this.publication().story.slug]),
	);

	private readonly appRouteTree = APP_ROUTE_TREE;
	private router = inject(Router);
}
