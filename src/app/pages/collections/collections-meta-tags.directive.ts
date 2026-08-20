import { Directive, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';

@Directive({
	selector: '[cuentonetaCollectionsMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class CollectionsMetaTagsDirective extends AbstractMetaTagsDirective {
	// A diferencia de las demás páginas indexables, no inyecta el host: nada de lo que emite depende del
	// catálogo, y atarlo a la lista sumaría una dependencia que solo puede fallar.
	protected applyMetaTags(): void {
		untracked(() => {
			this.head.setTitle('Colecciones');
			this.head.setDescription(
				'Todas las colecciones de La Cuentoneta: antologías temáticas de cuentos, poemas y textos breves para leer en línea.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(AppRoutes.Collection));
			this.head.setRobots('index, follow');
			this.head.setKeywords(['colecciones', 'antologías', 'literatura', 'cuentos', 'poemas', 'textos']);
		});
	}
}
