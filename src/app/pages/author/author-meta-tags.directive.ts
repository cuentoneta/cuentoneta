import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { buildAuthorMetaDescription } from '@app-utils/meta-description.util';
import { resolveSearchImage } from '@utils/sanity-image.utils';
import { HeadMetadata } from '../../directives/head-metadata.directive';
import { AbstractMetaTags } from '../../directives/abstract-meta-tags.directive';
import { AUTHOR_HOST } from './author-host';

@Directive({
	selector: '[cuentonetaAuthorMetaTags]',
	hostDirectives: [HeadMetadata],
})
export class AuthorMetaTags extends AbstractMetaTags {
	private readonly host = inject(AUTHOR_HOST);

	protected applyMetaTags(): void {
		const author = this.host.author();
		if (!author) {
			return;
		}
		untracked(() => {
			this.head.setTitle(author.name);
			this.head.setDescription(buildAuthorMetaDescription(author));
			this.applySearchImage(resolveSearchImage(author.imageUrl));
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Author}/${author.slug}`));
			this.head.setRobots('index, follow');
			this.head.setKeywords(['escritor', 'poemas', 'cuentos', 'autor', author.name.toLowerCase()]);
		});
	}
}
