import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationFrameComponent } from '@models/navigation-frame.component';
import { AppRoutes } from '../../app.routes';
import { StoryCard } from '@models/story.model';
import { StoryService } from '../../providers/story.service';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationBarConfig } from '../storylist-navigation-frame/storylist-navigation-frame.component';

@Component({
	selector: 'cuentoneta-author-navigation-frame',
	standalone: true,
	imports: [CommonModule],
	template: `@if (stories) {
		@for (story of stories; track $index) {
			{{ story | json }}
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

	readonly appRoutes = AppRoutes;

	constructor() {
		super();

		const storyService = inject(StoryService);
		this.fetchContentDirective
			.fetchContent$<StoryCard[]>(
				this.activatedRoute.queryParams.pipe(switchMap(({ slug }) => storyService.getByAuthorSlug(slug))),
			)
			.pipe(takeUntilDestroyed())
			.subscribe((stories) => {
				this.stories = stories;
				this.config.set({
					headerTitle: 'Más del autor',
					footerTitle: 'Ver más...',
					navigationRoute: this.router.createUrlTree([this.appRoutes.Author, 'abacab']),
					showFooter: true,
				});
			});
	}
}
