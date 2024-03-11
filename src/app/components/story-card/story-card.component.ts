import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';

// Modelos
import { Story } from '@models/story.model';
import { Publication } from '@models/storylist.model';

import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { CommonModule, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-story-card',
	templateUrl: './story-card.component.html',
	styleUrls: ['./story-card.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		NgxSkeletonLoaderModule,
		NgIf,
		NgOptimizedImage,
		StoryCardSkeletonComponent,
		StoryEditionDateLabelComponent,
	],
	providers: [DatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardComponent implements OnInit {
	@Input() editionPrefix: string | undefined;
	@Input() editionSuffix: string | undefined;
	@Input() comingNextLabel: string = '';
	@Input() displayDate: boolean = false;
	@Input() publication: Publication<Story> | undefined;
	@Input() editionIndex: number = 0;

	editionLabel: string = '';
	previewText: string = '';

	private datePipe = inject(DatePipe);

	ngOnInit() {
		const dateFormat = this.datePipe.transform(this.publication?.publishingDate, `dd 'de' MMMM, YYYY`);
		this.editionLabel = `${this.editionPrefix} ${this.editionIndex} ${this.displayDate ? ' - ' + dateFormat : ''}${
			this.editionSuffix ? ' | ' + this.editionSuffix : ''
		}`;
		this.comingNextLabel = this.displayDate ? `${this.comingNextLabel} ${dateFormat}` : this.comingNextLabel;

		this.previewText = this.publication?.story.paragraphs.map((paragraph) => paragraph.text).join(' ') ?? '';
	}
}
