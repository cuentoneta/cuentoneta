// Core
import { Component, inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

// Routing
import { AppRoutes } from '../../app.routes';

// Models
import { StoryCard } from '@models/story.model';

// Providers
import { StoryService } from '../../providers/story.service';

// Componentes
import { NavigationFrameComponent } from '@models/navigation-frame.component';
import { NavigableStoryTeaserComponent } from '../navigable-story-teaser/navigable-story-teaser.component';

@Component({
	selector: 'cuentoneta-author-navigation-frame',
	standalone: true,
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
	stories: StoryCard[] = [];
	authorSlug: string = '';

	readonly appRoutes = AppRoutes;

	constructor() {
		super();

		const storyService = inject(StoryService);

		this.activatedRoute.queryParams
			.pipe(
				takeUntilDestroyed(),
				switchMap(({ navigationSlug }) => {
					this.authorSlug = navigationSlug;
					return this.fetchContentDirective.fetchContent$<StoryCard[]>(storyService.getByAuthorSlug(navigationSlug));
				}),
			)
			.subscribe((stories) => {
				this.stories = stories;
				this.config.set({
					headerTitle: 'Más del autor',
					footerTitle: 'Ver más...',
					navigationRoute: this.router.createUrlTree([this.appRoutes.Author, this.authorSlug]),
					showFooter: true,
				});
			});
	}
}
