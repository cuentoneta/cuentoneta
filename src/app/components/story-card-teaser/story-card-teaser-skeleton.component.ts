import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-story-card-teaser-skeleton',
	imports: [CommonModule, NgxSkeletonLoaderModule],
	providers: [ThemeService],
	template: `<article class="flex gap-4">
		@if (order()) {
			<ngx-skeleton-loader
				[theme]="{
					height: '36px',
					'margin-bottom': 0,
					width: '40px',
					'background-color': orderColor
				}"
				count="1"
				appearance="line"
			></ngx-skeleton-loader>
		}
		<div class="flex flex-1 flex-col  gap-1">
			@if (showAuthor()) {
				<div class="flex items-center gap-2">
					<ngx-skeleton-loader
						[theme]="{
							height: '24px',
							margin: 0,
							width: '24px'
						}"
						count="1"
						appearance="circle"
						class="flex items-center"
					></ngx-skeleton-loader>
					<ngx-skeleton-loader
						[theme]="{
							height: '20px',
							'margin-bottom': 0
						}"
						class="w-full"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
				</div>
			}
			<div class="flex flex-col gap-1">
				<ngx-skeleton-loader
					[theme]="{
						height: '28px',
						'margin-bottom': 0,
						'background-color': skeletonTextColor
					}"
					class="w-full"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
				<footer class="inter-body-xs flex gap-1 text-gray-500">
					<ngx-skeleton-loader
						[theme]="{
							height: '16px',
							'margin-bottom': 0,
							width: '120px'
						}"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
					<span>•</span>
					<ngx-skeleton-loader
						[theme]="{
							height: '16px',
							'margin-bottom': 0,
							width: '40px'
						}"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
				</footer>
			</div>
		</div>
	</article>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserSkeletonComponent {
	// Inputs
	order = input<number>();
	showAuthor = input<boolean>(false);

	// Providers
	skeletonTextColor = inject(ThemeService).pickColor('zinc', 300);
	orderColor = inject(ThemeService).pickThemeColor('primary-300');
}
