import { ChangeDetectionStrategy, Component } from '@angular/core';
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
			}"
			count="1"
			appearance="line"
			class="title-skeleton"
		/>
		<div class="flex gap-2">
			<ngx-skeleton-loader
				[theme]="{
					height: '20px',
					width: '100px',
					'margin-bottom': 0,
				}"
				count="1"
				appearance="line"
				class="tag-skeleton"
			/>
			<ngx-skeleton-loader
				[theme]="{
					height: '20px',
					width: '100px',
					'margin-bottom': 0,
				}"
				count="1"
				appearance="line"
				class="tag-skeleton"
			/>
			<ngx-skeleton-loader
				[theme]="{
					height: '20px',
					width: '100px',
					'margin-bottom': 0,
				}"
				count="1"
				appearance="line"
				class="tag-skeleton"
			/>
		</div>
	</div>`,
	styles: `
		@reference '#tailwind-theme';

		:host ::ng-deep .title-skeleton .skeleton-loader,
		:host ::ng-deep .tag-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistTitleSkeleton {}
