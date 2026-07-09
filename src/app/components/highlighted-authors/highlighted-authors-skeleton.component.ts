import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AuthorTeaserV3SkeletonComponent } from '@components/author-teaser-v3/author-teaser-v3-skeleton.component';

@Component({
	selector: 'cuentoneta-highlighted-authors-skeleton',
	imports: [AuthorTeaserV3SkeletonComponent],
	template: `
		@for (_ of skeletons; track $index) {
			<cuentoneta-author-teaser-v3-skeleton data-testid="skeleton" />
		}
	`,
	host: {
		class: 'contents',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightedAuthorsSkeletonComponent {
	protected readonly skeletons = Array.from({ length: 6 });
}
