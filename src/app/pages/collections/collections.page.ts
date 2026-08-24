import { Component, computed, effect, forwardRef, inject, RESPONSE_INIT, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidChevronDown, faSolidXmark } from '@ng-icons/font-awesome/solid';

import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

import { CollectionApi } from '../../providers/collection.provider';

import type { Tag } from '@models/tag.model';

import { COLLECTIONS_HOST, type CollectionsHost } from './collections-host';
import { CollectionsMetaTagsDirective } from './collections-meta-tags.directive';
import { CollectionsStructuredDataDirective } from './collections-structured-data.directive';

import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';
import { DividerComponent } from '@components/divider/divider.component';

/** Una etiqueta del catálogo con cuántas de las colecciones a la vista la llevan. */
export interface CollectionFacet {
	readonly tag: Tag;
	readonly count: number;
}

@Component({
	selector: 'cuentoneta-collections',
	templateUrl: './collections.page.html',
	providers: [
		{ provide: COLLECTIONS_HOST, useExisting: forwardRef(() => CollectionsPage) },
		provideIcons({ faSolidCheck, faSolidChevronDown, faSolidXmark }),
	],
	hostDirectives: [CollectionsMetaTagsDirective, CollectionsStructuredDataDirective],
	imports: [CollectionTeaserCard, CollectionTeaserCardSkeletonComponent, DividerComponent, NgIcon],
})
export default class CollectionsPage implements CollectionsHost {
	private readonly collectionApi = inject(CollectionApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	// Bloqueante y no progresivo: el HTML se serializa antes de la respuesta, y el hub saldría sin
	// ninguno de los enlaces que viene a ofrecer.
	private readonly catalogResource = ssrBlockingRxResource({
		stream: () => this.collectionApi.getAll(),
		defaultValue: [],
	});

	// El `order(title asc)` de la query compara por punto de código: manda al final todo título con
	// acento o eñe inicial, y Sanity no expone colación con plegado.
	private readonly collator = new Intl.Collator('es');

	// Sin filtrar: es lo que describen los datos estructurados, y la canónica apunta siempre al
	// catálogo completo.
	public readonly collections = computed(() => {
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return [...catalog].sort((first, second) => this.collator.compare(first.title, second.title));
	});

	protected readonly failed = computed(() => this.catalogResource.status() === 'error');

	protected readonly loading = computed(() => this.catalogResource.isLoading());

	private readonly selectedSlugs = signal<readonly string[]>([]);

	private readonly categoryGroupOpen = signal(true);
	protected readonly isCategoryGroupOpen = this.categoryGroupOpen.asReadonly();

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
		const counts = new Map<string, { tag: Tag; count: number }>();
		for (const collection of this.visibleCollections()) {
			for (const tag of collection.tags) {
				const seen = counts.get(tag.slug);
				counts.set(tag.slug, { tag, count: (seen?.count ?? 0) + 1 });
			}
		}
		return [...counts.values()].sort((first, second) => this.collator.compare(first.tag.title, second.tag.title));
	});

	protected readonly selectedTags = computed<readonly Tag[]>(() => {
		const selected = this.selectedSlugs();
		const known = new Map(this.collections().flatMap((collection) => collection.tags.map((tag) => [tag.slug, tag])));
		return selected.flatMap((slug) => {
			const tag = known.get(slug);
			return tag ? [tag] : [];
		});
	});

	// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página. No hay
	// rama 404 — un catálogo no deja de existir.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.catalogResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});

	protected isSelected(slug: string): boolean {
		return this.selectedSlugs().includes(slug);
	}

	protected toggleTag(slug: string): void {
		this.selectedSlugs.update((selected) =>
			selected.includes(slug) ? selected.filter((candidate) => candidate !== slug) : [...selected, slug],
		);
	}

	protected clearFilters(): void {
		this.selectedSlugs.set([]);
	}

	protected toggleCategoryGroup(): void {
		this.categoryGroupOpen.update((open) => !open);
	}
}
