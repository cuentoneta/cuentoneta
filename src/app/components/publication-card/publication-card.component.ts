import { ChangeDetectionStrategy, Component, computed, inject, input, Input, OnInit } from '@angular/core';

// Modelos
import { StoryCard } from '@models/story.model';
import { Publication } from '@models/storylist.model';

import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { CommonModule, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';
import { APP_ROUTE_TREE } from '../../app.routes';
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
					[comingNextLabel]="comingNextLabel()"
				/>
			}
		</article>
	`,
	standalone: true,
	imports: [
		CommonModule,
		NgxSkeletonLoaderModule,
		NgIf,
		NgOptimizedImage,
		StoryCardSkeletonComponent,
		StoryEditionDateLabelComponent,
		PortableTextParserComponent,
		MediaResourceTagsComponent,
		StoryCardContentComponent,
	],
	providers: [DatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent {
	displayDate = input<boolean>(false);
	publication = input.required<Publication<StoryCard>>();
	comingNextLabel = input('', {
		transform: (value: string): string => {
			const dateFormat = this.datePipe.transform(this.publication()?.publishingDate, `dd 'de' MMMM, YYYY`);
			return this.displayDate() ? `${value} ${dateFormat}` : value;
		},
	});

	navigationLink = computed(() =>
		this.router.createUrlTree(['/', this.appRouteTree['STORY'], this.publication().story.slug]),
	);

	private readonly appRouteTree = APP_ROUTE_TREE;
	private datePipe = inject(DatePipe);
	private router = inject(Router);
}
