import { Component, inject, input } from '@angular/core';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { StoryCardTeaserV3Component } from '@components/story-card-teaser-v3/story-card-teaser-v3.component';
import { TagComponent } from '@components/tag/tag.component';
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { storylistMock } from '@mocks/storylist.mock';

// Blueprint de la CollectionPage V3 (spike). Página temporal en /collection/:slug con placeholders para cada
// región del diseño de Figma; se irá reemplazando por los componentes reales. Marcada `noindex` mientras es
// un placeholder (no debe indexarse ni competir con /storylist/:slug).
@Component({
	selector: 'cuentoneta-collection',
	imports: [StoryCardTeaserV3Component, TagComponent, PortableTextParserComponent],
	hostDirectives: [HeadMetadataDirective],
	templateUrl: './collection.component.html',
})
export default class CollectionComponent {
	public readonly slug = input<string>();

	// Datos de ejemplo del corpus Onoff mientras el blueprint no consume un servicio real.
	protected readonly collection = storylistMock;

	private readonly metaTagsDirective = inject(HeadMetadataDirective);

	constructor() {
		this.metaTagsDirective.setTitle('Colección (blueprint)');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('collection'));
		this.metaTagsDirective.setRobots('noindex, nofollow');
	}
}
