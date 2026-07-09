import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AuthorApi } from '../../providers/author-api.interface';
import { ssrBlockingRxResource } from '@utils/ssr-resource';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { AppRoutes } from '../../app.routes';
import { AuthorTeaserV3Component } from '@components/author-teaser-v3/author-teaser-v3.component';
import { AuthorTeaserV3SkeletonComponent } from '@components/author-teaser-v3/author-teaser-v3-skeleton.component';

@Component({
	selector: 'cuentoneta-authors',
	imports: [AuthorTeaserV3Component, AuthorTeaserV3SkeletonComponent],
	hostDirectives: [HeadMetadataDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<main class="content horizontal-layout-spacing vertical-layout-spacing">
			<section class="flex flex-col gap-8">
				<header class="flex flex-col gap-1">
					<h1 class="font-inter text-2xl font-bold text-neutral-900">Autores/as</h1>
					<p class="font-inter text-sm font-medium text-neutral-600">
						Explorá el catálogo completo de autores y autoras de La Cuentoneta
					</p>
				</header>

				<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					@defer (when authors().length > 0) {
						@for (author of authors(); track author._id) {
							<cuentoneta-author-teaser-v3 [author]="author" data-testid="author-teaser" />
						}
					} @loading (minimum 500ms) {
						@for (_ of skeletons; track $index) {
							<cuentoneta-author-teaser-v3-skeleton data-testid="skeleton" />
						}
					}
				</section>
			</section>
		</main>
	`,
})
export default class AuthorsComponent {
	private readonly authorService = inject(AuthorApi);
	private readonly metaTagsDirective = inject(HeadMetadataDirective);

	private readonly authorsResource = ssrBlockingRxResource({
		stream: () => this.authorService.getAll(),
		defaultValue: [],
	});

	protected readonly authors = computed(() => this.authorsResource.value());
	protected readonly skeletons = Array.from({ length: 6 });

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Autores/as');
		this.metaTagsDirective.setDescription(
			'Explorá el catálogo completo de autores y autoras publicados en La Cuentoneta',
		);
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl(AppRoutes.Authors));
		this.metaTagsDirective.setRobots('noindex, follow');
	}
}
