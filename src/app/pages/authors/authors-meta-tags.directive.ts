import { Directive, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';

@Directive({
	selector: '[cuentonetaAuthorsMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class AuthorsMetaTagsDirective extends AbstractMetaTagsDirective {
	// No inyecta el host: nada de lo que emite depende del índice, y el índice puede fallar.
	protected applyMetaTags(): void {
		untracked(() => {
			this.head.setTitle('Autores');
			this.head.setDescription(
				'Índice de autoras y autores publicados en La Cuentoneta: cuentos, poemas y textos breves para leer en línea.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(AppRoutes.Authors));
			this.head.setRobots('index, follow');
			this.head.setKeywords(['autores', 'autoras', 'escritores', 'literatura', 'cuentos', 'poemas']);
		});
	}
}
