import { Component } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-collection-teaser-skeleton',
	imports: [NgxSkeletonLoaderModule],
	template: `
		<article class="flex items-start gap-5">
			<section class="flex h-[192px] flex-1 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3">
				<ngx-skeleton-loader
					[theme]="{
						height: '164px',
						width: '118px',
						'margin-bottom': '-8px',
						'border-radius': '4px',
					}"
					count="1"
					appearance="line"
					class="image-skeleton"
				/>
			</section>
			<section class="flex flex-1 flex-col gap-1 overflow-hidden">
				<ngx-skeleton-loader
					[theme]="{
						height: '18px',
						'margin-bottom': '5px',
						'margin-top': '5px',
						width: '80%',
					}"
					count="1"
					appearance="line"
					class="title-skeleton"
				/>
				<div class="mt-1">
					<ngx-skeleton-loader
						[theme]="{
							height: '14px',
							'margin-bottom': '3px',
							'margin-top': '3px',
							width: '100%',
						}"
						count="2"
						appearance="line"
					/>
					<ngx-skeleton-loader
						[theme]="{
							height: '14px',
							'margin-bottom': '3px',
							'margin-top': '3px',
							width: '100%',
						}"
						count="1"
						appearance="line"
					/>
				</div>
				<footer class="mt-1 flex gap-1">
					<ngx-skeleton-loader
						[theme]="{
							height: '12px',
							'margin-bottom': '2px',
							'margin-top': '2px',
							width: '80px',
						}"
						count="1"
						appearance="line"
						class="tag-skeleton"
					/>
					<ngx-skeleton-loader
						[theme]="{
							height: '12px',
							'margin-bottom': '2px',
							'margin-top': '2px',
							width: '80px',
						}"
						count="1"
						appearance="line"
						class="count-skeleton"
					/>
				</footer>
			</section>
		</article>
	`,
	styles: `
		@reference '../../../tailwind.css';

		:host ::ng-deep .image-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
		:host ::ng-deep .title-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
		:host ::ng-deep .tag-skeleton .skeleton-loader {
			@apply bg-brand-300;
		}
	`,
})
export class CollectionTeaserSkeleton {}
