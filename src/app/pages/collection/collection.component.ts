import { Component, inject, input } from '@angular/core';

import type { StorylistTeaser } from '@models/storylist.model';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { StoryCardTeaserV3Component } from '@components/story-card-teaser-v3/story-card-teaser-v3.component';
import { TagComponent } from '@components/tag/tag.component';
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { CoverImageComponent } from '@components/cover-image/cover-image.component';
import { NavigableCollectionTeaserComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser.component';
import { storylistMock, storylistTeaserSampleMock } from '@mocks/storylist.mock';

// Blueprint de la CollectionPage V3 (spike). Página temporal en /collection/:slug con placeholders para cada
// región del diseño de Figma; se irá reemplazando por los componentes reales. Marcada `noindex` mientras es
// un placeholder (no debe indexarse ni competir con /storylist/:slug).
@Component({
	selector: 'cuentoneta-collection',
	imports: [
		StoryCardTeaserV3Component,
		TagComponent,
		PortableTextParserComponent,
		CoverImageComponent,
		NavigableCollectionTeaserComponent,
	],
	hostDirectives: [HeadMetadataDirective],
	templateUrl: './collection.component.html',
})
export default class CollectionComponent {
	public readonly slug = input<string>();

	// Datos de ejemplo del corpus Onoff mientras el blueprint no consume un servicio real.
	protected readonly collection = storylistMock;

	// Colecciones sugeridas de ejemplo (distintas de la actual y con categorías variadas para el blueprint).
	protected readonly suggestedCollections: StorylistTeaser[] = [
		{
			...storylistTeaserSampleMock,
			count: 12,
			tags: [{ title: 'Curaduría', slug: 'curaduria', shortDescription: '', description: [] }],
		},
		{
			...storylistTeaserSampleMock,
			_id: 'onoff-creaciones',
			slug: 'creaciones-de-navidad',
			title: 'Creaciones de Navidad',
			count: 8,
			tags: [{ title: 'Antología', slug: 'antologia', shortDescription: '', description: [] }],
		},
		{
			...storylistTeaserSampleMock,
			_id: 'onoff-textos-invierno',
			slug: 'textos-de-invierno',
			title: 'Textos de invierno',
			count: 6,
			tags: [{ title: 'Selección', slug: 'seleccion', shortDescription: '', description: [] }],
		},
	];

	private readonly metaTagsDirective = inject(HeadMetadataDirective);

	constructor() {
		this.metaTagsDirective.setTitle('Colección (blueprint)');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('collection'));
		this.metaTagsDirective.setRobots('noindex, nofollow');
	}
}
