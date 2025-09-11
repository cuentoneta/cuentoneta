import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-story-card-skeleton',
	imports: [NgxSkeletonLoaderModule, StoryEditionDateLabelComponent],
	templateUrl: './story-card-skeleton.component.html',
	styles: `
		:host {
			@apply flex flex-col gap-2 md:gap-4;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardSkeletonComponent {
	readonly animation = input<'progress' | 'progress-dark' | 'pulse' | 'false' | false>(false);
	readonly displayDate = input<boolean>(false);
	readonly editionLabel = input<string>('');
	readonly comingNextLabel = input<string>('');
	readonly displayFooter = input<boolean>(true);

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
