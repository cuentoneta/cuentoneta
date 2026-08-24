import { Component, computed, effect, forwardRef, inject, RESPONSE_INIT, signal } from '@angular/core';

import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

import { CollectionApi } from '../../providers/collection.provider';

import { COLLECTIONS_HOST, type CollectionsHost } from './collections-host';
import { CollectionsMetaTagsDirective } from './collections-meta-tags.directive';
import { CollectionsStructuredDataDirective } from './collections-structured-data.directive';

import {
	CollectionFiltersComponent,
	type CollectionFacet,
} from '@components/collection-filters/collection-filters.component';
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';
import { DividerComponent } from '@components/divider/divider.component';

@Component({
	selector: 'cuentoneta-collections',
	templateUrl: './collections.page.html',
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

	private readonly selectedSlugs = signal<readonly string[]>([]);

	protected readonly visibleCollections = computed(() => {
		const selected = this.selectedSlugs();
		if (selected.length === 0) {
			return this.collections();
		}
		return this.collections().filter((collection) =>
			selected.every((slug) => collection.tags.some((tag) => tag.slug === slug)),
		);
	});

	// Se cuentan sobre lo visible y no sobre el catálogo entero: de ahí que al elegir una etiqueta las
	// demás bajen su número y las que no conviven con ella desaparezcan.
	protected readonly facets = computed<readonly CollectionFacet[]>(() => {
		const selected = new Set(this.selectedSlugs());
		const counts = new Map<string, CollectionFacet>();
		for (const collection of this.visibleCollections()) {
			for (const tag of collection.tags) {
				const seen = counts.get(tag.slug);
				counts.set(tag.slug, { tag, count: (seen?.count ?? 0) + 1, selected: selected.has(tag.slug) });
			}
		}
		return [...counts.values()].sort((first, second) => this.collator.compare(first.tag.title, second.tag.title));
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
