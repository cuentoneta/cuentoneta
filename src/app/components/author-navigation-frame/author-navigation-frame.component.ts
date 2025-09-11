// Core
import { Component, computed, effect, inject } from '@angular/core';

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
	imports: [NavigableStoryTeaserComponent],
	template: `@if (stories(); as stories) {
		@for (story of stories; track $index) {
			<cuentoneta-navigable-story-teaser
				[story]="story"
				[selected]="selectedStorySlug() === story.slug"
				[authorSlug]="authorSlug()"
			/>
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
	private storyService = inject(StoryService);

	// Recursos
	private readonly storiesResource = rxResource({
		params: () => this.navigationSlug(),
		stream: ({ params: slug }) => this.storyService.getNavigationTeasersByAuthorSlug(slug),
	});

	// Propiedades
	readonly stories = computed(() => this.storiesResource.value());
	readonly authorSlug = computed(() => this.navigationSlug() ?? '');

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
