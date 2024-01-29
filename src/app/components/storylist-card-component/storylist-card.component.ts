// Angular Core
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// Router
import { RouterLink } from '@angular/router';
import { APP_ROUTE_TREE } from '../../app.routes';

// Módulos
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Modelos
import { StorylistCard } from '@models/storylist.model';

// Componentes
import { BadgeComponent } from '../badge/badge.component';

@Component({
	selector: 'cuentoneta-storylist-card',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, BadgeComponent, RouterLink, NgxSkeletonLoaderModule],
	styleUrl: './storylist-card.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<article>
			@if (!!storylist) {
				<div
					[routerLink]="['/' + appRouteTree['STORYLIST']]"
					[queryParams]="{ slug: storylist?.slug }"
					class="navigation-link"
				>
					<header>
						<img [ngSrc]="storylist.featuredImage ?? ''" width="602" height="240" />
					</header>
					<section class="flex flex-col gap-4 pt-5 px-4">
						<h1 class="card-title">{{ storylist?.title }}</h1>
						<p class="description">{{ storylist?.description }}</p>
						<hr />
					</section>
				</div>
				<footer class="flex justify-end pt-4 px-5 pb-5">
					@if (!!storylist.tags && storylist.tags.length > 0) {
						@for (tag of storylist?.tags; track tag.slug) {
							<cuentoneta-badge [tag]="tag" [showIcon]="true" class="ml-3" />
						}
					}
				</footer>
			} @else {
				<ngx-skeleton-loader
					[animation]="'progress-dark'"
					[theme]="{
						height: '240px',
						'margin-bottom': 0,
						width: '100%'
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
				<section class="flex flex-col gap-4 pt-5 px-4">
					<ngx-skeleton-loader
						[theme]="{
							'background-color': '#D4D4D8',
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
					<hr />
				</section>
				<footer class="flex justify-end pt-4 px-5 pb-5">
					<ngx-skeleton-loader
						[theme]="{
							'background-color': '#D4D4D8',
							height: '22px',
							'margin-bottom': 0,
							width: '80px'
						}"
						count="1"
						appearance="line"
					></ngx-skeleton-loader>
					<ngx-skeleton-loader
						[theme]="{
							'background-color': '#D4D4D8',
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
})
export class StorylistCardComponent {
	@Input() storylist: StorylistCard | undefined;

	protected readonly appRouteTree = APP_ROUTE_TREE;
}
