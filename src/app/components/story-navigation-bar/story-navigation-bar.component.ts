// Core
import { Component, computed, inject, Type } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// 3rd Party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { injectParams } from 'ngxtension/inject-params';
import { injectQueryParams } from 'ngxtension/inject-query-params';

// Services
import { NavigationFrameService } from '../../providers/navigation-frame.service';

// Componentes
import { StorylistNavigationFrameComponent } from '../storylist-navigation-frame/storylist-navigation-frame.component';
import { AuthorNavigationFrameComponent } from '../author-navigation-frame/author-navigation-frame.component';
import { NavigationFrameComponent } from '@models/navigation-frame.component';

@Component({
	selector: 'cuentoneta-story-navigation-bar',
	template: `
		<section class="grid grid-cols-1 gap-y-0.5 rounded-xl bg-gray-200 shadow-lg">
			<header [attr.aria-busy]="frameConfig().headerTitle" class="bg-gray-50 px-7 py-5">
				@if (frameConfig().headerTitle) {
					<a [routerLink]="frameConfig().navigationRoute.toString()">
						<h2 class="h3 hover:text-interactive-500">{{ frameConfig().headerTitle }}</h2>
					</a>
				} @else {
					<ng-container *ngTemplateOutlet="titleSkeleton"></ng-container>
				}
			</header>

			@if (frame(); as frame) {
				<ng-container *ngComponentOutlet="frame.component; inputs: frame.inputs"></ng-container>
			}

			<footer class="bg-gray-50 px-7 py-5">
				@if (frameConfig().showFooter) {
					<a [routerLink]="frameConfig().navigationRoute.toString()">
						<h3 class="h3 inter-body-xl-bold hover:text-interactive-500">Ver más...</h3>
					</a>
				} @else {
					<ng-container *ngTemplateOutlet="titleSkeleton"></ng-container>
				}
			</footer>
		</section>

		<ng-template #titleSkeleton>
			<ngx-skeleton-loader
				[theme]="{
					'height.px': 15,
					'background-color': '#D4D4D8'
				}"
				count="2"
				appearance="line"
			></ngx-skeleton-loader>
		</ng-template>
	`,
	standalone: true,
	imports: [CommonModule, NgxSkeletonLoaderModule, RouterLink],
})
export class StoryNavigationBarComponent {
	private params = injectParams();
	private queryParams = injectQueryParams();

	// Inyección de providers
	private navigationFrameService = inject(NavigationFrameService);

	frame = computed(() => {
		const { slug } = this.params();
		const { navigation } = this.queryParams();
		return this.setNavigationFrame(slug, navigation);
	});

	frameConfig = this.navigationFrameService.navigationBarConfig;

	private setNavigationFrame(
		slug: string,
		navigation: 'author | storylist',
	): {
		component: Type<NavigationFrameComponent> | null;
		inputs: { selectedStorySlug: string };
	} {
		const navigationFrames = [
			{ navigation: 'author', component: AuthorNavigationFrameComponent },
			{ navigation: 'storylist', component: StorylistNavigationFrameComponent },
		];

		const component = navigationFrames.find((c) => c.navigation === navigation)?.component ?? null;

		return { component, inputs: { selectedStorySlug: slug } };
	}
}
