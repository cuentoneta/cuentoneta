import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { AUTHOR_HOST } from './author-host';

@Directive({
	selector: '[cuentonetaAuthorMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class AuthorMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(AUTHOR_HOST);

	protected applyMetaTags(): void {
		const author = this.host.author();
		if (!author) {
			return;
		}
		untracked(() => {
			this.head.setTitle(author.name);
			this.head.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Author}/${author.slug}`));
			this.head.setRobots('index, follow');
			this.head.setKeywords(['escritor', 'poemas', 'cuentos', 'autor', author.name.toLowerCase()]);
		});
	}
}
