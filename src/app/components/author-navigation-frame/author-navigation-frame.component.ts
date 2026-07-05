// Core
import { Component, computed, effect, inject } from '@angular/core';

// Routing
import { AppRoutes } from '../../app.routes';

// Providers
import { StoryApi } from '../../providers/story-api.interface';

// Componentes
import { NavigationFrameComponent } from '@models/navigation-frame.component';
import { NavigableStoryTeaserComponent } from '../navigable-story-teaser/navigable-story-teaser.component';
import { progressiveRxResource } from '@utils/ssr-resource';

@Component({
	selector: 'cuentoneta-author-navigation-frame',
	imports: [NavigableStoryTeaserComponent],
	host: {
		class: 'grid grid-cols-1 gap-y-0.5 rounded-xl bg-neutral-200 shadow-lg',
	},
	template: `@if (stories(); as stories) {
		@for (story of stories; track $index) {
			<cuentoneta-navigable-story-teaser
				[story]="story"
				[selected]="selectedStorySlug() === story.slug"
				[authorSlug]="authorSlug()"
			/>
		}
	}`,
})
export class AuthorNavigationFrameComponent extends NavigationFrameComponent {
	private readonly appRoutes = AppRoutes;

	// Providers
	private storyService = inject(StoryApi);

	// Recursos
	private readonly storiesResource = progressiveRxResource({
		params: () => this.navigationSlug(),
		stream: ({ params: slug }) => this.storyService.getNavigationTeasersByAuthorSlug(slug),
		defaultValue: [],
	});

	// Propiedades
	protected readonly stories = computed(() => this.storiesResource.value());
	protected readonly authorSlug = computed(() => this.navigationSlug() ?? '');

	constructor() {
		super();
		effect(() => {
			this.config.set({
				headerTitle: 'Más del autor',
				footerTitle: 'Ver más...',
				navigationRoute: this.router.createUrlTree([this.appRoutes.Author, this.navigationSlug()]),
				showFooter: true,
			});
		});
	}
}
