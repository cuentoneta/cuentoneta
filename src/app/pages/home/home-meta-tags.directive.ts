import { Directive } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';

@Directive({
	selector: '[cuentonetaHomeMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class HomeMetaTagsDirective extends AbstractMetaTagsDirective {
	protected applyMetaTags(): void {
		this.head.setExactTitle('Cuentos y relatos breves para leer en línea | La Cuentoneta');
		this.head.setDefaultDescription();
		this.head.setKeywords([
			'cuentos',
			'relatos breves',
			'literatura',
			'poemas',
			'narraciones',
			'lectura digital',
			'cuentos para leer',
			'literatura breve',
			'colecciones de cuentos',
			'leer en línea',
		]);
		this.head.setCanonicalUrl(buildCanonicalUrl(AppRoutes.Home));
		this.head.setRobots('index, follow');
	}
}
