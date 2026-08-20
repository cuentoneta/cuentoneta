// Core
import { Component, computed, effect, inject, input, RESPONSE_INIT, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';

// Utils
import { progressiveRxResource, ssrBlockingRxResource } from '@app-utils/ssr-resource';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

// Services
import { CollectionApi } from '../../providers/collection.provider';

// SEO
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AppRoutes } from '../../app.routes';

// Components
import { CollectionInfoPanelComponent } from '@components/collection-info-panel/collection-info-panel.component';
import { DividerComponent } from '@components/divider/divider.component';
import { DrawerComponent } from '@components/drawer/drawer.component';
import { LiteraryWorkCardTeaserComponent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { NavigableCollectionTeaserComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser.component';
import { NavigableCollectionTeaserSkeletonComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser-skeleton.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-collection',
	templateUrl: './collection.page.html',
	hostDirectives: [HeadMetadataDirective],
	imports: [
		CollectionInfoPanelComponent,
		DrawerComponent,
		NgTemplateOutlet,
		DividerComponent,
		LiteraryWorkCardTeaserComponent,
		NavigableCollectionTeaserComponent,
		NavigableCollectionTeaserSkeletonComponent,
		SkeletonComponent,
	],
})
export default class CollectionPage {
	public readonly slug = input.required<string>();

	private readonly collectionApi = inject(CollectionApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
	private readonly head = inject(HeadMetadataDirective);

	// Cuántas colecciones se ofrecen al pie. El criterio con que se eligen todavía no existe: hoy es el
	// orden del catálogo, salteando la que se está leyendo.
	private readonly suggestedCollectionsCount = 3;

	// Los 160 px que el diseño reserva para la descripción en la columna, sobre un interlineado de 20.
	protected readonly sidebarDescriptionLines = 8;

	// Gatea la creación del contenido del panel deslizable: sin esto, la descripción entera y tres
	// enlaces internos viajarían en el HTML del servidor, duplicando lo que la columna ya muestra.
	protected readonly isDescriptionDrawerOpen = signal(false);

	// Bloquea el render del servidor: con un recurso progresivo el HTML se serializa antes de la
	// respuesta, y una colección inexistente saldría 200 con esqueleto — un 404 blando y cacheable.
	private readonly collectionResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.collectionApi.getBySlug(params),
		defaultValue: undefined,
	});

	// El catálogo es accesorio: si falla, el bloque de sugeridas queda vacío y la página se sirve igual.
	private readonly catalogResource = progressiveRxResource({
		stream: () => this.collectionApi.getAll(),
		defaultValue: [],
	});

	protected readonly collection = computed(() =>
		this.collectionResource.hasValue() ? this.collectionResource.value() : undefined,
	);
	protected readonly notFound = computed(() => this.collectionResource.status() === 'error');

	protected readonly suggestedCollections = computed(() => {
		const slug = this.slug();
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return catalog.filter((collection) => collection.slug !== slug).slice(0, this.suggestedCollectionsCount);
	});

	// `/collection/:slug` es una ruta nueva que todavía no se expone a buscadores: se sirve
	// `noindex, nofollow` y sin datos estructurados. El robots se emite antes del guard a propósito,
	// para que la señal salga también cuando la colección no carga.
	// TODO: al conectar las directivas de indexado de la página, revertir este opt-out (#1838).
	private readonly applyHeadMetadataEffect = effect(() => {
		this.head.setRobots('noindex, nofollow');
		const collection = this.collection();
		if (!collection) {
			return;
		}
		untracked(() => {
			this.head.setTitle(collection.title);
			this.head.setDescription(
				'Una colección de La Cuentoneta: una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Collection}/${collection.slug}`));
		});
	});

	// Un fallo transitorio no puede salir 200: el borde cachearía una página vacía como si fuera la
	// colección. Solo la ausencia real de la colección es un 404.
	private readonly respondErrorStatusEffect = effect(() => {
		const error = this.collectionResource.error();
		if (!error || !this.responseInit) {
			return;
		}
		this.responseInit.status = error instanceof HttpErrorResponse && error.status === 404 ? 404 : 503;
	});

	protected excerptLinesFor(showAuthors: boolean): number {
		return showAuthors ? 3 : 4;
	}

	protected openDescriptionDrawer(drawer: DrawerComponent): void {
		this.isDescriptionDrawerOpen.set(true);
		drawer.open();
	}
}
