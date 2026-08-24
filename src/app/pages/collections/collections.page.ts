import { Component, computed, effect, inject, RESPONSE_INIT } from '@angular/core';

import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { CollectionApi } from '../../providers/collection.provider';

@Component({
	selector: 'cuentoneta-collections',
	template: `
		<!-- El encabezado es fijo: sin el margen superior, la página arranca debajo de él. -->
		<main class="mx-auto mt-header-height flex w-full max-w-310 flex-col gap-12 px-4 pt-8 pb-16">
			<h1 class="font-inter text-2xl leading-8 font-bold text-neutral-900">
				{{ collections().length }} {{ collections().length === 1 ? 'Colección' : 'Colecciones' }}
			</h1>

			@if (loading()) {
				<section class="flex flex-col gap-8" aria-busy="true">
					@for (placeholder of [1, 2, 3, 4]; track placeholder) {
						<cuentoneta-collection-teaser-card-skeleton class="w-full" />
					}
				</section>
			} @else if (failed()) {
				<p class="font-inter text-base text-neutral-700" data-testid="catalog-error">
					No pudimos cargar las colecciones. Probá de nuevo en un rato.
				</p>
			} @else if (collections().length > 0) {
				<section class="flex flex-col gap-8" data-testid="collections">
					@for (collection of collections(); track collection.slug) {
						<cuentoneta-collection-teaser-card [collection]="collection" class="w-full" />
					}
				</section>
			} @else {
				<p class="font-inter text-base text-neutral-700" data-testid="catalog-empty">
					Todavía no hay colecciones publicadas.
				</p>
			}
		</main>
	`,
	hostDirectives: [HeadMetadataDirective],
	imports: [CollectionTeaserCard, CollectionTeaserCardSkeletonComponent],
})
export default class CollectionsPage {
	private readonly collectionApi = inject(CollectionApi);
	private readonly metaTagsDirective = inject(HeadMetadataDirective);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	private readonly catalogResource = ssrBlockingRxResource({
		stream: () => this.collectionApi.getAll(),
		defaultValue: [],
	});

	// El `order(title asc)` de la query compara por punto de código: manda al final todo título con
	// acento o eñe inicial, y Sanity no expone colación con plegado.
	private readonly collator = new Intl.Collator('es');

	protected readonly collections = computed(() => {
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return [...catalog].sort((first, second) => this.collator.compare(first.title, second.title));
	});

	protected readonly failed = computed(() => this.catalogResource.status() === 'error');

	protected readonly loading = computed(() => this.catalogResource.isLoading());

	// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página. No hay
	// rama 404 — un catálogo no deja de existir.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.catalogResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});

	constructor() {
		this.updateMetaTags();
	}

	// TODO(#2288): quitar el `noindex` al sumar los metadatos propios y los datos estructurados.
	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Colecciones');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('collection'));
		this.metaTagsDirective.setRobots('noindex, follow');
	}
}
