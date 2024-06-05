import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-story-card-skeleton',
	standalone: true,
	imports: [CommonModule, NgxSkeletonLoaderModule, StoryEditionDateLabelComponent],
	templateUrl: './story-card-skeleton.component.html',
	styles: `
		:host {
			@apply flex flex-col gap-2 md:gap-4;
		}
	`,
})
export class StoryCardSkeletonComponent {
	@Input() animation: 'progress' | 'progress-dark' | 'pulse' | 'false' | false = false;
	@Input() displayDate: boolean = false;
	@Input() editionLabel: string = '';
	@Input() comingNextLabel: string = '';

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
