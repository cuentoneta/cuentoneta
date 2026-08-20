// Core
import { Component, computed, effect, forwardRef, inject, RESPONSE_INIT } from '@angular/core';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

// Services
import { CollectionApi } from '../../providers/collection.provider';

// SEO
import { COLLECTIONS_HOST, type CollectionsHost } from './collections-host';
import { CollectionsMetaTagsDirective } from './collections-meta-tags.directive';
import { CollectionsStructuredDataDirective } from './collections-structured-data.directive';

// Components
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

@Component({
	selector: 'cuentoneta-collections',
	templateUrl: './collections.page.html',
	providers: [{ provide: COLLECTIONS_HOST, useExisting: forwardRef(() => CollectionsPage) }],
	hostDirectives: [CollectionsMetaTagsDirective, CollectionsStructuredDataDirective],
	imports: [CollectionTeaserCard, CollectionTeaserCardSkeletonComponent],
})
export default class CollectionsPage implements CollectionsHost {
	private readonly collectionApi = inject(CollectionApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	// El catálogo es el contenido de la página, no un accesorio: con un recurso progresivo el HTML se
	// serializa antes de la respuesta y el hub saldría sin ninguno de los enlaces que viene a ofrecer.
	private readonly catalogResource = ssrBlockingRxResource({
		stream: () => this.collectionApi.getAll(),
		defaultValue: [],
	});

	// El `order(title asc)` de la query compara por punto de código, así que manda al final del catálogo
	// todo título que empiece con acento o eñe. Se reordena acá, como ya se hace en el índice de autores.
	private readonly collator = new Intl.Collator('es');

	// `value()` lanza con el recurso en error, así que el guard no es defensivo: sin él, el fallo del
	// catálogo se propaga al render en vez de caer en el estado que la página tiene previsto.
	public readonly collections = computed(() => {
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return [...catalog].sort((first, second) => this.collator.compare(first.title, second.title));
	});

	protected readonly failed = computed(() => this.catalogResource.status() === 'error');

	// Un fallo transitorio no puede salir 200: el borde cachearía un catálogo vacío como si fuera la
	// página. No hay rama 404 — un catálogo no deja de existir.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.catalogResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});
}
