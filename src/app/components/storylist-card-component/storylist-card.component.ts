// Core
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// Router
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// 3rd Party Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { StorylistTeaser } from '@models/storylist.model';

// Components
import { BadgeComponent } from '../badge/badge.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

// Providers
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-storylist-card',
	standalone: true,
	imports: [
		CommonModule,
		NgOptimizedImage,
		BadgeComponent,
		RouterLink,
		NgxSkeletonLoaderModule,
		PortableTextParserComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<article class="shadow-lg hover:shadow-lg-hover">
			@if (storylist(); as storylist) {
				<div [routerLink]="['/' + appRoutes.StoryList, storylist.slug]" class="navigation-link">
					<header class="h-[240px] max-w-[602px] cursor-pointer">
						<img
							[ngSrc]="storylist.featuredImage"
							width="602"
							height="240"
							class="h-[240px] rounded-t-lg object-cover"
							alt=""
						/>
					</header>
					<section class="flex flex-col gap-4 border-1 border-y-0 border-solid border-primary-300 px-4 pt-5">
						<h1 class="h1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:text-interactive-500">
							{{ storylist.title }}
						</h1>
						<p class="min-h-9">
							<cuentoneta-portable-text-parser [paragraphs]="storylist.description"></cuentoneta-portable-text-parser>
						</p>
						<hr class="text-gray-300" />
					</section>
				</div>
				<footer
					class="flex justify-end rounded-b-lg border-1 border-t-0 border-solid border-primary-300 px-5 pb-5 pt-4"
				>
					@if (!!storylist.tags && storylist.tags.length > 0) {
						@for (tag of storylist.tags; track tag.slug) {
							<cuentoneta-badge [tag]="tag" [showIcon]="true" class="ml-3" />
						}
					}
				</footer>
			} @else {
				<ngx-skeleton-loader
					[animation]="'progress-dark'"
					[theme]="{
						'border-radius': '0',
						'border-top-left-radius': '8px',
						'border-top-right-radius': '8px',
						height: '240px',
						'margin-bottom': 0,
						width: '100%'
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
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
			}
		</article>
	`,
	styles: `
		:host {
			@apply block max-w-[602px];
		}
	`,
})
export class StorylistCardComponent {
	storylist = input<StorylistTeaser>();

	protected readonly appRoutes = AppRoutes;

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
