import { Component } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-storylist-card-skeleton',
	imports: [NgxSkeletonLoaderModule],
	template: `
		<section class="flex flex-col gap-4 px-4 pt-5">
			<ngx-skeleton-loader
				[theme]="{
					height: '40px',
					'margin-bottom': 0,
					width: '100%',
				}"
				count="1"
				appearance="line"
				class="storylist-title-skeleton"
			/>
			<div>
				<ngx-skeleton-loader
					[theme]="{
						height: '16px',
						'margin-bottom': '8px',
						width: '100%',
					}"
					count="2"
					appearance="line"
				/>
				<ngx-skeleton-loader
					[theme]="{
						height: '16px',
						'margin-bottom': '8px',
						width: '80%',
					}"
					count="1"
					appearance="line"
				/>
			</div>
			<hr class="text-neutral-300" />
		</section>
		<footer class="flex justify-end rounded-b-lg px-5 pb-5 pt-4">
			<ngx-skeleton-loader
				[theme]="{
					height: '22px',
					'margin-bottom': 0,
					width: '80px',
				}"
				count="1"
				appearance="line"
				class="footer-button-skeleton"
			/>
			<ngx-skeleton-loader
				[theme]="{
					height: '22px',
					'margin-left': '16px',
					'margin-bottom': 0,
					width: '80px',
				}"
				count="1"
				appearance="line"
				class="footer-button-skeleton"
			/>
		</footer>
	`,
	styles: `
		:host ::ng-deep .storylist-title-skeleton .skeleton-loader,
		:host ::ng-deep .footer-button-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
})
export class StorylistCardSkeletonComponent {}
