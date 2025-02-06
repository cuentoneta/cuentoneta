// Core
import { Component, effect, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

// 3rd party modules
import { injectQueryParams } from 'ngxtension/inject-query-params';

// Routing
import { AppRoutes } from '../../app.routes';

// Models
import { StoryTeaser } from '@models/story.model';

// Providers
import { StoryService } from '../../providers/story.service';

// Componentes
import { NavigationFrameComponent } from '@models/navigation-frame.component';
import { NavigableStoryTeaserComponent } from '../navigable-story-teaser/navigable-story-teaser.component';

@Component({
	selector: 'cuentoneta-author-navigation-frame',
	imports: [CommonModule, NavigableStoryTeaserComponent],
	template: `@if (stories) {
		@for (story of stories; track $index) {
			<cuentoneta-navigable-story-teaser
				[story]="story"
				[selected]="selectedStorySlug() === story.slug"
				[authorSlug]="authorSlug"
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

	stories: StoryTeaser[] = [];

	authorSlug: string = '';

	constructor() {
		super();

		effect((cleanUp) => {
			const { navigationSlug } = this.queryParams();
			const subscription = this.stories$(navigationSlug).subscribe((stories) => {
				this.stories = stories;
				this.authorSlug = navigationSlug;
				this.config.set({
					headerTitle: 'Más del autor',
					footerTitle: 'Ver más...',
					navigationRoute: this.router.createUrlTree([this.appRoutes.Author, navigationSlug]),
					showFooter: true,
				});
			});
			cleanUp(() => subscription.unsubscribe());
		});
	}

	// TODO: Issue #1010 - Cambiar los tipos a la hora de generar los endpoints correspondientes para obtener los teasers de navegación
	private stories$(slug: string): Observable<StoryTeaser[]> {
		return this.fetchContentDirective.fetchContent$<StoryTeaser[]>(this.storyService.getByAuthorSlug(slug));
	}
}
