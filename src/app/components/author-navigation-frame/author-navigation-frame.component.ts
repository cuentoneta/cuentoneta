// Core
import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd party modules
import { injectQueryParams } from 'ngxtension/inject-query-params';

// Routing
import { AppRoutes } from '../../app.routes';

// Providers
import { StoryService } from '../../providers/story.service';

// Componentes
import { NavigationFrameComponent } from '@models/navigation-frame.component';
import { NavigableStoryTeaserComponent } from '../navigable-story-teaser/navigable-story-teaser.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
	selector: 'cuentoneta-author-navigation-frame',
	imports: [CommonModule, NavigableStoryTeaserComponent],
	template: `@if (stories(); as stories) {
		@for (story of stories; track $index) {
			<cuentoneta-navigable-story-teaser
				[story]="story"
				[selected]="selectedStorySlug() === story.slug"
				[authorSlug]="authorSlug()"
			></cuentoneta-navigable-story-teaser>
		}
	}`,
	styles: `
		:host {
			@apply grid grid-cols-1 gap-y-0.5 rounded-xl bg-gray-200 shadow-lg;
		}
	`,
})
export class AuthorNavigationFrameComponent extends NavigationFrameComponent {
	readonly appRoutes = AppRoutes;

	// Providers
	private queryParams = injectQueryParams();
	private storyService = inject(StoryService);

	// Recursos
	private readonly storiesResource = rxResource({
		request: () => this.queryParams(),
		loader: (params) => this.storyService.getNavigationTeasersByAuthorSlug(params.request['navigationSlug']),
	});

	// Propiedades
	stories = computed(() => this.storiesResource.value());
	authorSlug = computed(() => this.queryParams()?.['navigationSlug'] ?? '');

	constructor() {
		super();

		effect(() => {
			const { navigationSlug } = this.queryParams();

			this.config.set({
				headerTitle: 'Más del autor',
				footerTitle: 'Ver más...',
				navigationRoute: this.router.createUrlTree([this.appRoutes.Author, navigationSlug]),
				showFooter: true,
			});
		});
	}
}
