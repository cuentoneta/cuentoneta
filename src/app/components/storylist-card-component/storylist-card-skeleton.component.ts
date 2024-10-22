import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-storylist-card-skeleton',
	standalone: true,
	imports: [CommonModule, NgxSkeletonLoaderModule],
	template: `
		<section class="flex flex-col gap-4 px-4 pt-5">
			<ngx-skeleton-loader
				[theme]="{
					'background-color': skeletonColor,
					height: '40px',
					'margin-bottom': 0,
					width: '100%'
				}"
				count="1"
				appearance="line"
			></ngx-skeleton-loader>
			<div>
				<ngx-skeleton-loader
					[theme]="{
						height: '16px',
						'margin-bottom': '8px',
						width: '100%'
					}"
					count="2"
					appearance="line"
				></ngx-skeleton-loader>
				<ngx-skeleton-loader
					[theme]="{
						height: '16px',
						'margin-bottom': '8px',
						width: '80%'
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
			</div>
			<hr class="text-gray-300" />
		</section>
		<footer class="flex justify-end rounded-b-lg px-5 pb-5 pt-4">
			<ngx-skeleton-loader
				[theme]="{
					'background-color': skeletonColor,
					height: '22px',
					'margin-bottom': 0,
					width: '80px'
				}"
				count="1"
				appearance="line"
			></ngx-skeleton-loader>
			<ngx-skeleton-loader
				[theme]="{
					'background-color': skeletonColor,
					height: '22px',
					'margin-left': '16px',
					'margin-bottom': 0,
					width: '80px'
				}"
				count="1"
				appearance="line"
			></ngx-skeleton-loader>
		</footer>
	`,
})
export class StorylistCardSkeletonComponent {
	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
