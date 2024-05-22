import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';

// Modelos
import { StoryCard } from '@models/story.model';
import { Publication } from '@models/storylist.model';

import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { CommonModule, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { StoryCardContentComponent } from '../story-card-content/story-card-content.component';

@Component({
	selector: 'cuentoneta-publication-card',
	template: ` <article
		[attr.aria-busy]="!publication"
		class="card border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:p-8"
	>
		@if (!!publication && publication.published) {
			@if (publication.story; as story) {
				<cuentoneta-story-card-content [story]="story" [headerText]="editionLabel"></cuentoneta-story-card-content>
			}
		} @else {
			@if (!publication) {
				<cuentoneta-story-card-skeleton [animation]="'progress'" />
			}
			@if (!!publication && !publication.published) {
				<cuentoneta-story-card-skeleton
					[animation]="false"
					[displayDate]="false"
					[editionLabel]="editionLabel"
					[comingNextLabel]="comingNextLabel"
				/>
			}
		}
	</article>`,
	standalone: true,
	imports: [
		CommonModule,
		NgxSkeletonLoaderModule,
		NgIf,
		NgOptimizedImage,
		StoryCardSkeletonComponent,
		StoryEditionDateLabelComponent,
		PortableTextParserComponent,
		StoryCardContentComponent,
	],
	providers: [DatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent implements OnInit {
	@Input() editionPrefix: string | undefined;
	@Input() editionSuffix: string | undefined;
	@Input() comingNextLabel: string = '';
	@Input() displayDate: boolean = false;
	@Input() publication: Publication<StoryCard> | undefined;
	@Input() editionIndex: number = 0;

	editionLabel: string = '';

	private datePipe = inject(DatePipe);

	ngOnInit() {
		const dateFormat = this.datePipe.transform(this.publication?.publishingDate, `dd 'de' MMMM, YYYY`);
		this.editionLabel = `${this.editionPrefix} ${this.editionIndex} ${this.displayDate ? ' - ' + dateFormat : ''}${
			this.editionSuffix ? ' | ' + this.editionSuffix : ''
		}`;
		this.comingNextLabel = this.displayDate ? `${this.comingNextLabel} ${dateFormat}` : this.comingNextLabel;
	}
}
