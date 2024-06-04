import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';

// Modelos
import { StoryCard } from '@models/story.model';
import { Publication } from '@models/storylist.model';

import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { CommonModule, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { MediaResourceTagsComponent } from '../media-resource-tags/media-resource-tags.component';

@Component({
	selector: 'cuentoneta-publication-card',
	templateUrl: './publication-card.component.html',
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
	],
	providers: [DatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent implements OnInit {
	@Input() comingNextLabel: string = '';
	@Input() displayDate: boolean = false;
	@Input() publication: Publication<StoryCard> | undefined;

	private datePipe = inject(DatePipe);

	ngOnInit() {
		const dateFormat = this.datePipe.transform(this.publication?.publishingDate, `dd 'de' MMMM, YYYY`);

		this.comingNextLabel = this.displayDate ? `${this.comingNextLabel} ${dateFormat}` : this.comingNextLabel;
	}
}
