import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-story-card-skeleton',
	imports: [CommonModule, NgxSkeletonLoaderModule, StoryEditionDateLabelComponent],
	templateUrl: './story-card-skeleton.component.html',
	styles: `
		:host {
			@apply flex flex-col gap-2 md:gap-4;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardSkeletonComponent {
	animation = input<'progress' | 'progress-dark' | 'pulse' | 'false' | false>(false);
	displayDate = input<boolean>(false);
	editionLabel = input<string>('');
	comingNextLabel = input<string>('');
	displayFooter = input<boolean>(true);

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
