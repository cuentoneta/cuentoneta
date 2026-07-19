import { afterRenderEffect, Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';

import type { StorylistTeaser } from '@models/storylist.model';
import { StorylistApi } from '../../providers/storylist-api.interface';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { progressiveRxResource } from '@utils/ssr-resource';
import { StoryCardTeaserV3Component } from '@components/story-card-teaser-v3/story-card-teaser-v3.component';
import { TagComponent } from '@components/tag/tag.component';
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { CoverImageComponent } from '@components/cover-image/cover-image.component';
import { NavigableCollectionTeaserComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser.component';
import { NavigableCollectionTeaserSkeletonComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser-skeleton.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { DrawerComponent } from '@components/drawer/drawer.component';
import { ButtonComponent } from '@components/button/button.component';
import { storylistTeaserSampleMock } from '@mocks/storylist.mock';

// Blueprint de la CollectionPage V3 (spike). Página en /collection/:slug: trae la colección real desde Sanity por
// slug (misma vía que /storylist/:slug) y la renderiza con los componentes V3. Marcada `noindex` mientras el
// diseño se estabiliza; por eso el fetch es no bloqueante (progressiveRxResource). La lista de «colecciones
// sugeridas» todavía usa datos de ejemplo (no hay endpoint de sugeridas).
@Component({
	selector: 'cuentoneta-collection',
	imports: [
		StoryCardTeaserV3Component,
		TagComponent,
		PortableTextParserComponent,
		CoverImageComponent,
		NavigableCollectionTeaserComponent,
		NavigableCollectionTeaserSkeletonComponent,
		SkeletonComponent,
		DrawerComponent,
		ButtonComponent,
	],
	hostDirectives: [HeadMetadataDirective],
	templateUrl: './collection.component.html',
})
export default class CollectionComponent {
	public readonly slug = input.required<string>();

	private readonly storylistService = inject(StorylistApi);

	private readonly collectionResource = progressiveRxResource({
		params: this.slug,
		stream: ({ params }) => this.storylistService.get(params, 60, 'asc'),
		defaultValue: undefined,
	});
	// `value()` lanza si el resource está en error; `hasValue()` no. Así el estado de error cae a "sin resultados".
	protected readonly collection = computed(() =>
		this.collectionResource.hasValue() ? this.collectionResource.value() : undefined,
	);
	protected readonly isLoading = this.collectionResource.isLoading;

	// Descripción del sidebar recortada a 8 líneas: se muestra "Leer más" solo si el texto real desborda el clamp.
	private readonly descriptionEl = viewChild<ElementRef<HTMLElement>>('description');
	protected readonly isDescriptionOverflowing = signal(false);

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

		// Mide el desborde del clamp después de renderizar (scrollHeight real vs. alto visible) y expone el
		// resultado a la plantilla. `earlyRead` lee el DOM; `write` fija el signal con ese valor.
		afterRenderEffect({
			earlyRead: () => {
				const el = this.descriptionEl()?.nativeElement;
				return !!el && el.scrollHeight > el.clientHeight + 1;
			},
			write: (overflowing) => this.isDescriptionOverflowing.set(overflowing()),
		});
	}
}
