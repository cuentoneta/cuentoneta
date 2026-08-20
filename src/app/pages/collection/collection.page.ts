// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';

// Utils
import { progressiveRxResource, ssrBlockingRxResource } from '@app-utils/ssr-resource';

// Services
import { CollectionApi } from '../../providers/collection.provider';

// SEO
import { COLLECTION_HOST, type CollectionHost } from './collection-host';
import { CollectionMetaTagsDirective } from './collection-meta-tags.directive';
import { CollectionStructuredDataDirective } from './collection-structured-data.directive';

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
	providers: [{ provide: COLLECTION_HOST, useExisting: forwardRef(() => CollectionPage) }],
	hostDirectives: [CollectionMetaTagsDirective, CollectionStructuredDataDirective],
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
export default class CollectionPage implements CollectionHost {
	public readonly slug = input.required<string>();

	private readonly collectionApi = inject(CollectionApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

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

	public readonly collection = computed(() =>
		this.collectionResource.hasValue() ? this.collectionResource.value() : undefined,
	);
	protected readonly notFound = computed(() => this.collectionResource.status() === 'error');

	protected readonly suggestedCollections = computed(() => {
		const slug = this.slug();
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return catalog.filter((collection) => collection.slug !== slug).slice(0, this.suggestedCollectionsCount);
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

	// Con el autor a la vista, al extracto le queda una línea menos.
	protected readonly excerptLines = computed(() => (this.collection()?.config.showAuthors ? 3 : 4));

	protected openDescriptionDrawer(drawer: DrawerComponent): void {
		this.isDescriptionDrawerOpen.set(true);
		drawer.open();
	}
}
