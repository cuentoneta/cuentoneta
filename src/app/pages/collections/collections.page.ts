import { Component, computed, effect, forwardRef, inject, RESPONSE_INIT, signal } from '@angular/core';

import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

import { CollectionApi } from '../../providers/collection.provider';

import { COLLECTIONS_HOST, type CollectionsHost } from './collections-host';
import { CollectionsMetaTagsDirective } from './collections-meta-tags.directive';
import { CollectionsStructuredDataDirective } from './collections-structured-data.directive';

import { CollectionFiltersComponent } from '@components/collection-filters/collection-filters.component';
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';
import { DividerComponent } from '@components/divider/divider.component';

@Component({
	selector: 'cuentoneta-collections',
	template: `
		<!-- El encabezado es fijo: sin el margen superior, la página arranca debajo de él. -->
		<main class="mx-auto mt-header-height flex w-full max-w-310 items-stretch gap-8 px-4 pt-8 pb-16">
			<cuentoneta-collection-filters
				(cleared)="clearFilters()"
				(toggled)="toggleTag($event.slug)"
				[collections]="visibleCollections()"
				[selected]="selectedSlugs()"
				class="hidden w-50 shrink-0 lg:flex"
				data-testid="filters"
			/>

			<cuentoneta-divider class="hidden lg:block" orientation="vertical" />

			<div class="flex min-w-0 flex-1 flex-col gap-12 lg:pl-5">
				<h1 class="font-inter text-2xl leading-8 font-bold text-neutral-900">
					{{ visibleCollections().length }} {{ visibleCollections().length === 1 ? 'Colección' : 'Colecciones' }}
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
				} @else if (visibleCollections().length > 0) {
					<section class="flex flex-col gap-8" data-testid="collections">
						@for (collection of visibleCollections(); track collection.slug) {
							<cuentoneta-collection-teaser-card [collection]="collection" class="w-full" />
						}
					</section>
				} @else {
					<p class="font-inter text-base text-neutral-700" data-testid="catalog-empty">
						Todavía no hay colecciones publicadas.
					</p>
				}
			</div>
		</main>
	`,
	providers: [{ provide: COLLECTIONS_HOST, useExisting: forwardRef(() => CollectionsPage) }],
	hostDirectives: [CollectionsMetaTagsDirective, CollectionsStructuredDataDirective],
	imports: [CollectionFiltersComponent, CollectionTeaserCard, CollectionTeaserCardSkeletonComponent, DividerComponent],
})
export default class CollectionsPage implements CollectionsHost {
	// Providers
	private readonly collectionApi = inject(CollectionApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	private readonly catalogResource = ssrBlockingRxResource({
		stream: () => this.collectionApi.getAll(),
		defaultValue: [],
	});

	// El `order(title asc)` de la query compara por punto de código: manda al final todo título con
	// acento o eñe inicial, y Sanity no expone colación con plegado.
	private readonly collator = new Intl.Collator('es');

	public readonly collections = computed(() => {
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return [...catalog].sort((first, second) => this.collator.compare(first.title, second.title));
	});

	protected readonly failed = computed(() => this.catalogResource.status() === 'error');

	protected readonly loading = computed(() => this.catalogResource.isLoading());

	protected readonly selectedSlugs = signal<readonly string[]>([]);

	protected readonly visibleCollections = computed(() => {
		const selected = this.selectedSlugs();
		if (selected.length === 0) {
			return this.collections();
		}
		return this.collections().filter((collection) =>
			selected.every((slug) => collection.tags.some((tag) => tag.slug === slug)),
		);
	});

	// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página. No hay
	// rama 404 — un catálogo no deja de existir.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.catalogResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});

	protected toggleTag(slug: string): void {
		this.selectedSlugs.update((selected) =>
			selected.includes(slug) ? selected.filter((candidate) => candidate !== slug) : [...selected, slug],
		);
	}

	protected clearFilters(): void {
		this.selectedSlugs.set([]);
	}
}
