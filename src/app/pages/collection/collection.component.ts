import { Component, inject, input } from '@angular/core';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

// Blueprint de la CollectionPage V3 (spike). Página temporal en /collection/:slug con placeholders para cada
// región del diseño de Figma; se irá reemplazando por los componentes reales. Marcada `noindex` mientras es
// un placeholder (no debe indexarse ni competir con /storylist/:slug).
@Component({
	selector: 'cuentoneta-collection',
	hostDirectives: [HeadMetadataDirective],
	templateUrl: './collection.component.html',
})
export default class CollectionComponent {
	public readonly slug = input<string>();

	private readonly metaTagsDirective = inject(HeadMetadataDirective);

	constructor() {
		this.metaTagsDirective.setTitle('Colección (blueprint)');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('collection'));
		this.metaTagsDirective.setRobots('noindex, nofollow');
	}
}
