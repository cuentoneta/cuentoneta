import { Component, computed, inject } from '@angular/core';

import { AuthorApi } from '../../providers/author-api.interface';
import { ssrBlockingRxResource } from '@utils/ssr-resource';
import { RouterLink } from '@angular/router';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

@Component({
	imports: [RouterLink],
	hostDirectives: [HeadMetadataDirective],
	template: `<main class="content horizontal-layout-spacing vertical-layout-spacing">
		<ul class="list-inside list-disc">
			@for (author of authors(); track author.slug) {
				<li>
					<span>
						<a [routerLink]="['/', 'author', author.slug]" class="underline">{{ author.name }}</a>
					</span>
				</li>
			}
		</ul>
	</main>`,
	styles: ``,
})
export default class AuthorsComponent {
	private authorService = inject(AuthorApi);
	private metaTagsDirective = inject(HeadMetadataDirective);

	private authorsResource = ssrBlockingRxResource({
		stream: () => this.authorService.getAll(),
		defaultValue: [],
	});

	protected readonly authors = computed(() => this.authorsResource.value());

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Índice de Autores');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('authors'));
		this.metaTagsDirective.setRobots('noindex, follow');
	}
}
