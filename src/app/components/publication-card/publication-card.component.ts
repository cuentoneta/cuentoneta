import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modelos
import { Publication, Storylist } from '@models/storylist.model';

// Componentes
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';

// Providers
import { UrlTree } from '@angular/router';

// Pipes
import { MapPublicationEditionLabelPipe } from '../../pipes/map-publication-edition-label.pipe';
import { MapPublicationComingNextLabelPipe } from '../../pipes/map-publication-coming-next-label.pipe';

@Component({
	selector: 'cuentoneta-publication-card',
	template: `
		<article
			class="card flex flex-col gap-2 border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:gap-4 md:p-8"
		>
			@if (publication().published) {
				<cuentoneta-story-card-content
					[story]="publication().story"
					[headerText]="publication() | mapPublicationEditionLabel: storylist()"
					[navigationLink]="navigationRoute()"
				/>
			} @else {
				<cuentoneta-story-card-skeleton
					[animation]="false"
					[displayDate]="false"
					[editionLabel]="publication() | mapPublicationEditionLabel: storylist()"
					[comingNextLabel]="publication() | mapPublicationComingNextLabel: storylist()"
				/>
			}
		</article>
	`,
	standalone: true,
	imports: [
		CommonModule,
		StoryCardSkeletonComponent,
		StoryCardContentComponent,
		MapPublicationEditionLabelPipe,
		MapPublicationComingNextLabelPipe,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent {
	storylist = input.required<Storylist>();
	publication = input.required<Publication>();
	navigationRoute = input.required<UrlTree>();
}
