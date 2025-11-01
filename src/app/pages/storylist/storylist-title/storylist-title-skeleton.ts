import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../providers/theme.service';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-storylist-title-skeleton',
	imports: [NgxSkeletonLoaderComponent],
	template: ` <div class="flex flex-col gap-5">
		<ngx-skeleton-loader
			[theme]="{
				height: '36px',
				width: '320px',
				'margin-bottom': 0,
				'background-color': skeletonColor,
			}"
			count="1"
			appearance="line"
		/>
		<div class="flex gap-2">
			<ngx-skeleton-loader
				[theme]="{
					height: '20px',
					width: '100px',
					'margin-bottom': 0,
					'background-color': skeletonColor,
				}"
				count="1"
				appearance="line"
			/>
			<ngx-skeleton-loader
				[theme]="{
					height: '20px',
					width: '100px',
					'margin-bottom': 0,
					'background-color': skeletonColor,
				}"
				count="1"
				appearance="line"
			/>
			<ngx-skeleton-loader
				[theme]="{
					height: '20px',
					width: '100px',
					'margin-bottom': 0,
					'background-color': skeletonColor,
				}"
				count="1"
				appearance="line"
			/>
		</div>
	</div>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistTitleSkeleton {
	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
}
