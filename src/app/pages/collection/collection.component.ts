// Core
import {
	afterRenderEffect,
	Component,
	computed,
	effect,
	ElementRef,
	inject,
	input,
	signal,
	untracked,
	viewChild,
} from '@angular/core';
import { map } from 'rxjs';

// Utils
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

// Models
import type { CollectionTeaser } from '@models/collection.model';

// Services
import { CollectionApi } from '../../providers/collection-api.interface';

// SEO
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AppRoutes } from '../../app.routes';

// Components
import { LiteraryWorkCardTeaserComponent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { TagComponent } from '@components/tag/tag.component';
import { CoverImageComponent } from '@components/cover-image/cover-image.component';
import { NavigableCollectionTeaserComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser.component';
import { NavigableCollectionTeaserSkeletonComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser-skeleton.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { DrawerComponent } from '@components/drawer/drawer.component';
import { ButtonComponent } from '@components/button/button.component';

// Blueprint de la CollectionPage V3 (spike). Página en /collection/:slug alimentada por el dominio Collection
// real —el que la épica fue construyendo desde este mismo spike— y renderizada con los componentes del Design
// System v3. Marcada `noindex` mientras el diseño se estabiliza; por eso el fetch es no bloqueante
// (progressiveRxResource) y no declara directivas de meta tags ni de datos estructurados.
@Component({
	selector: 'cuentoneta-collection',
	imports: [
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

	private readonly collectionApi = inject(CollectionApi);

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

	// Las «otras colecciones sugeridas» salen del catálogo real, descartando la que se está viendo. No hay
	// todavía un criterio de recomendación: el recorte a las primeras tres es del blueprint, no del producto.
	private readonly suggestedCollectionsResource = progressiveRxResource({
		params: this.slug,
		stream: ({ params }) =>
			this.collectionApi
				.getAll()
				.pipe(
					map((teasers) => teasers.filter((teaser) => teaser.slug !== params).slice(0, this.suggestedCollectionsCount)),
				),
		defaultValue: [],
	});
	// Bloque accesorio: si el catálogo falla, el sidebar se queda sin sugeridas en vez de romper la página.
	protected readonly suggestedCollections = computed<readonly CollectionTeaser[]>(() =>
		this.suggestedCollectionsResource.hasValue() ? this.suggestedCollectionsResource.value() : [],
	);

	// Descripción del sidebar recortada a 8 líneas: se muestra "Leer más" solo si el texto real desborda el clamp.
	private readonly descriptionEl = viewChild<ElementRef<HTMLElement>>('description');
	protected readonly isDescriptionOverflowing = signal(false);

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

	constructor() {
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
