import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modelos
import { Publication, Storylist } from '@models/storylist.model';

// Componentes
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';
import { CardComponent } from '../card/card.component';

// Providers
import { UrlTree } from '@angular/router';

// Pipes
import { MapPublicationEditionLabelPipe } from '../../pipes/map-publication-edition-label.pipe';
import { MapPublicationComingNextLabelPipe } from '../../pipes/map-publication-coming-next-label.pipe';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { AuthorTeaserComponent } from '../author-teaser/author-teaser.component';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';

@Component({
	selector: 'cuentoneta-publication-card',
	template: `
		@if (publication().published) {
			<cuentoneta-card [route]="navigationRoute()" [lang]="publication().story.language">
				<header slot="header">
					<cuentoneta-story-edition-date-label [label]="publication() | mapPublicationEditionLabel: storylist()" />
				</header>
				<cuentoneta-story-card-content
					[title]="publication().story.title"
					[body]="publication().story.paragraphs"
					slot="content"
				/>
				<div slot="footer" class="flex flex-col gap-2 md:gap-4">
					<hr class="text-gray-300" />
					<footer class="flex flex-row items-center justify-between">
						<cuentoneta-author-teaser [author]="publication().story.author" />
						<cuentoneta-media-resource-tags [resources]="publication().story.media" size="lg" />
					</footer>
				</div>
			</cuentoneta-card>
		} @else {
			<cuentoneta-story-card-skeleton
				[animation]="false"
				[displayDate]="false"
				[editionLabel]="publication() | mapPublicationEditionLabel: storylist()"
				[comingNextLabel]="publication() | mapPublicationComingNextLabel: storylist()"
				content
			/>
		}
	`,
	standalone: true,
	imports: [
		AuthorTeaserComponent,
		CardComponent,
		CommonModule,
		MapPublicationComingNextLabelPipe,
		MapPublicationEditionLabelPipe,
		MediaResourceTagsComponent,
		StoryCardContentComponent,
		StoryCardSkeletonComponent,
		StoryEditionDateLabelComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent {
	storylist = input.required<Storylist>();
	publication = input.required<Publication>();
	navigationRoute = input.required<UrlTree>();
}
