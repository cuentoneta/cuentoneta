// Core
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Services
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-content-campaign-carousel-skeleton',
	imports: [CommonModule, NgxSkeletonLoaderModule],
	template: ` <div class="mx-auto max-w-[960px]">
		<div class="slider">
			<header class="mb-3">
				<ngx-skeleton-loader
					[theme]="{
						'margin-top.px': 5,
						'margin-bottom.px': 5,
						'width.px': 192,
						'height.px': 18,
						'background-color': skeletonTextColor
					}"
					count="1"
					appearance="line"
					class="grid"
				></ngx-skeleton-loader>

				<ngx-skeleton-loader
					[theme]="{
						'margin-top.px': 4,
						'margin-bottom.px': 4,
						'width.px': 304,
						'height.px': 16,
						'background-color': skeletonTextColor
					}"
					count="1"
					appearance="line"
					class="grid"
				></ngx-skeleton-loader>
			</header>
			<ngx-skeleton-loader
				[theme]="{
					'justify-self': 'center',
					'border-radius.px': '16',
					'margin-bottom.px': 0,
					height: '100%',
					width: '100%',
					'background-color': skeletonBackgroundColor
				}"
				count="1"
				appearance="line"
				class="grid aspect-[540/220] w-full object-cover md:aspect-[960/280]"
			></ngx-skeleton-loader>
		</div>
		<div class="footer mt-[10px] h-[27px]">
			<ngx-skeleton-loader
				[theme]="{
					'justify-self': 'center',
					'border-radius.px': '16',
					'margin-top.px': 5,
					'margin-bottom.px': 5,
					'width.px': 48,
					'height.px': 10,
					'background-color': skeletonTextColor
				}"
				count="1"
				appearance="line"
				class="grid"
			></ngx-skeleton-loader>
		</div>
	</div>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCampaignCarouselSkeletonComponent {
	private themeService = inject(ThemeService);
	skeletonBackgroundColor = this.themeService.pickColor('zinc', 200);
	skeletonTextColor = this.themeService.pickColor('zinc', 300);
}
