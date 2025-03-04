// Core
import { Component, computed, inject, Type } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';

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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherArrowRight } from '@ng-icons/feather-icons';

@Component({
	selector: 'cuentoneta-story-navigation-bar',
	viewProviders: [provideIcons({ featherArrowRight })],
	template: `
		<div class="flex items-center gap-2">
			<a
				[routerLink]="frameConfig().navigationRoute.toString()"
				[attr.aria-busy]="frameConfig().headerTitle"
				class="flex h-16 gap-4 p-3"
			>
				<img
					[ngSrc]="
						'https://cdn.sanity.io/images/s4dbqkc5/development/c5f9949907e479e9d954299c5ba9e4b8b8a558e6-873x1235.png?h=384&w=288&auto=format'
					"
					height="40"
					width="24"
				/>
				<div>
					@if (frameConfig().headerTitle) {
						<h1 class="inter-body-sm-bold hover:text-interactive-500">{{ frameConfig().headerTitle }}</h1>
					}
					<span class="inter-body-sm">{{ navigation() }}</span>
				</div>
			</a>
			<ng-icon name="featherArrowRight" size="24px" class="text-gray-400" />
			<section class="grid grid-cols-1 gap-y-0.5">
				@if (frame(); as frame) {
					<ng-container *ngComponentOutlet="frame.component; inputs: frame.inputs"></ng-container>
				}
			</section>
		</div>
	`,
	imports: [CommonModule, NgxSkeletonLoaderModule, RouterLink, NgIcon, NgOptimizedImage],
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
	navigation = computed(() => this.queryParams()['navigation']);

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
