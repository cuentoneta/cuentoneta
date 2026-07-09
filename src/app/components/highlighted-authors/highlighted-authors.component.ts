import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthorTeaserV3Component } from '@components/author-teaser-v3/author-teaser-v3.component';
import { ButtonComponent } from '@components/button/button.component';
import type { HighlightedAuthor } from '@models/landing-page-content.model';
import { AppRoutes } from '../../app.routes';
import { HighlightedAuthorsSkeletonComponent } from './highlighted-authors-skeleton.component';

@Component({
	selector: 'cuentoneta-highlighted-authors',
	imports: [AuthorTeaserV3Component, ButtonComponent, HighlightedAuthorsSkeletonComponent, RouterLink],
	template: `
		<div class="flex items-center justify-between gap-4">
			<div class="flex min-w-0 flex-col gap-1">
				<h2 class="font-inter text-2xl font-bold text-neutral-900">Autores/as destacados/as</h2>
				<p class="font-inter text-sm text-neutral-600">Una selección curada de autores y autoras imprescindibles</p>
			</div>
			@if (showViewAll) {
				<a [routerLink]="['/', appRoutes.Authors]" cuentoneta-button type="outline">Ver todo</a>
			}
		</div>

		<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			@defer (when authors().length > 0) {
				@for (item of authors(); track item.author._id) {
					<cuentoneta-author-teaser-v3
						[author]="item.author"
						[tags]="item.tags"
						[storyCount]="item.storyCount"
						data-testid="author-teaser"
					/>
				}
			} @loading (minimum 500ms) {
				<cuentoneta-highlighted-authors-skeleton />
			}
		</section>
	`,
	host: {
		class: 'flex flex-col gap-8',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightedAuthorsComponent {
	protected readonly appRoutes = AppRoutes;
	protected readonly showViewAll = false;

	public readonly authors = input<HighlightedAuthor[]>([]);
}
