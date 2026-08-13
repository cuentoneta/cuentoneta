// Core
import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

// Utils
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

// Services
import { CollectionApi } from '../../providers/collection-api.interface';

// SEO
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AppRoutes } from '../../app.routes';

// Directives
import { ClampOverflowDirective } from '../../directives/clamp-overflow.directive';

// Components
import { LiteraryWorkCardTeaserComponent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { TagComponent } from '@components/tag/tag.component';
import { CoverImageComponent } from '@components/cover-image/cover-image.component';
import { NavigableCollectionTeaserComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser.component';
import { NavigableCollectionTeaserSkeletonComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser-skeleton.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { DrawerComponent } from '@components/drawer/drawer.component';
import { ButtonComponent } from '@components/button/button.component';

// Blueprint de la CollectionPage V3 (spike). Página en /collection/:slug alimentada por el dominio Collection y
// renderizada con los componentes del Design System v3. Marcada `noindex` mientras el diseño se estabiliza; por
// eso el fetch es no bloqueante (progressiveRxResource) y no declara directivas de meta tags ni de datos
// estructurados.
@Component({
	selector: 'cuentoneta-collection',
	imports: [
		NgTemplateOutlet,
		ClampOverflowDirective,
		LiteraryWorkCardTeaserComponent,
		TagComponent,
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

	private readonly suggestedCollectionsCount = 3;

	// Posiciones del abanico de portadas cuando la colección no tiene una editorial propia: [0] central al
	// frente con bottom-bleed, [1] y [2] laterales desplazadas. Mismas que en CollectionTeaserCard.
	protected readonly sampleImageClasses = [
		'absolute bottom-[-8px] left-1/2 z-20 -translate-x-1/2 border-[3px] border-neutral-100',
		'absolute top-[calc(50%_+_39.35px)] left-[calc(50%_-_82.75px)] z-10 -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100',
		'absolute top-[calc(50%_+_39.35px)] left-[calc(50%_+_83.03px)] z-10 -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100',
	] as const;

	private readonly collectionApi = inject(CollectionApi);
	private readonly sanitizer = inject(DomSanitizer);

	private readonly collectionResource = progressiveRxResource({
		params: this.slug,
		stream: ({ params }) => this.collectionApi.getBySlug(params),
		defaultValue: undefined,
	});
	// `value()` lanza si el resource está en error; `hasValue()` no. Así el estado de error cae a "sin resultados".
	protected readonly collection = computed(() =>
		this.collectionResource.hasValue() ? this.collectionResource.value() : undefined,
	);
	protected readonly isLoading = this.collectionResource.isLoading;

	// El backend entrega la descripción ya saneada por el pipeline compartido, y el brand del tipo es la prueba
	// de que pasó por ahí. Sin el bypass, el sanitizer de Angular vuelve a recortar una marcación que ya está
	// acotada a la allow-list, y el énfasis de la prosa se pierde.
	protected readonly safeDescription = computed(() => {
		const collection = this.collection();
		return collection ? this.sanitizer.bypassSecurityTrustHtml(collection.description) : undefined;
	});

	// El catálogo entero se pide una vez: no depende del slug, así que navegar entre colecciones lo filtra de
	// nuevo en vez de volver a pedirlo.
	private readonly catalogResource = progressiveRxResource({
		stream: () => this.collectionApi.getAll(),
		defaultValue: [],
	});
	// Bloque accesorio: si el catálogo falla, el sidebar se queda sin sugeridas en vez de romper la página.
	// Todavía no hay criterio de recomendación: el recorte es del blueprint, no del producto.
	protected readonly suggestedCollections = computed(() =>
		(this.catalogResource.hasValue() ? this.catalogResource.value() : [])
			.filter((teaser) => teaser.slug !== this.slug())
			.slice(0, this.suggestedCollectionsCount),
	);

	private readonly head = inject(HeadMetadataDirective);

	private readonly applyHeadMetadataEffect = effect(() => {
		const slug = this.slug();
		untracked(() => {
			this.head.setRobots('noindex, nofollow');
			this.head.setTitle('Colección (blueprint)');
			this.head.setDefaultDescription();
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Collection}/${slug}`));
		});
	});
}
