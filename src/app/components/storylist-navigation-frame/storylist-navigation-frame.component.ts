import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrlTree } from '@angular/router';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { injectQueryParams } from 'ngxtension/inject-query-params';

// Models
import { PublicationNavigationTeaser } from '@models/storylist.model';

// Routes
import { AppRoutes } from '../../app.routes';
import { NavigationFrameComponent } from '@models/navigation-frame.component';

// Services
import { StorylistService } from '../../providers/storylist.service';

// Componentes
import { NavigablePublicationTeaserComponent } from '../navigable-publication-teaser/navigable-publication-teaser.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherChevronDown } from '@ng-icons/feather-icons';

export type NavigationBarConfig = {
	headerTitle: string;
	footerTitle: string;
	navigationRoute: UrlTree | string;
	showFooter: boolean;
};

@Component({
	selector: 'cuentoneta-storylist-navigation-frame',
	imports: [CommonModule, NavigablePublicationTeaserComponent, NgxSkeletonLoaderModule, NgIcon],
	viewProviders: [provideIcons({ featherChevronDown })],

	template: ` @if (true) {
		@if (storylist(); as storylist) {
			@if (selectedPublication(); as selectedPublication) {
				<button (click)="showList = !showList" class="flex items-center justify-between gap-4 pr-3 md:w-[420px]">
					<cuentoneta-navigable-publication-teaser
						[publication]="selectedPublication"
						[selected]="false"
						[storylist]="storylist"
					/>
					<ng-icon name="featherChevronDown" size="32px" class="text-gray-400" />
				</button>
			}
			@if (showList) {
				<div
					class="divide fixed top-32 divide-y-1 divide-gray-200 overflow-y-scroll border-t-1 border-gray-200 bg-gray-50 shadow-lg md:h-96 md:w-[420px]"
				>
					@for (publication of displayedPublications; track $index) {
						<div>
							<cuentoneta-navigable-publication-teaser
								(click)="showList = false"
								[publication]="publication"
								[selected]="selectedStorySlug() === publication.story.slug"
								[storylist]="storylist"
							/>
						</div>
					}
				</div>
			}
		}
	}`,
	styles: `
		:host {
			@apply z-20 grid grid-cols-1;
		}
	`,
})
export class StorylistNavigationFrameComponent extends NavigationFrameComponent {
	// Routes
	readonly appRoutes = AppRoutes;

	// Providers
	private queryParams = injectQueryParams();
	private storylistService = inject(StorylistService);

	// Recursos
	private readonly storylistResource = rxResource({
		request: () => this.queryParams(),
		loader: (params) => this.storylistService.getStorylistNavigationTeasers(params.request['navigationSlug']),
	});

	// Propiedades
	showList = false;
	displayedPublications: PublicationNavigationTeaser[] = [];
	storylist = computed(() => this.storylistResource.value());
	selectedPublication = computed(() =>
		this.storylist()?.publications.find((p) => p.story.slug === this.selectedStorySlug()),
	);

	constructor() {
		super();

		effect(() => {
			const storylist = this.storylist();

			if (!storylist) {
				return;
			}

			this.displayedPublications = storylist.publications;
			this.config.set({
				headerTitle: storylist.title,
				footerTitle: 'Ver más...',
				navigationRoute: this.router.createUrlTree([this.appRoutes.StoryList, storylist.slug]),
				showFooter: true,
			});
		});
	}
}
