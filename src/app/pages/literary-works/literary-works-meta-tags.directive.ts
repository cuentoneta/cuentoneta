import { Directive, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';

@Directive({
	selector: '[cuentonetaLiteraryWorksMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class LiteraryWorksMetaTagsDirective extends AbstractMetaTagsDirective {
	// No inyecta el host: nada de lo que emite depende del catálogo, y el catálogo puede fallar.
	protected applyMetaTags(): void {
		untracked(() => {
			this.head.setTitle('Obras');
			this.head.setDescription(
				'Todas las obras publicadas en La Cuentoneta: cuentos, poemas y relatos breves para leer en línea.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(AppRoutes.LiteraryWork));
			this.head.setRobots('index, follow');
			this.head.setKeywords(['obras', 'cuentos', 'poemas', 'relatos', 'literatura', 'lecturas']);
		});
	}
}
