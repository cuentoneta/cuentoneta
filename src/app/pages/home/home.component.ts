// Core
import { Component, computed, effect, inject, RESPONSE_INIT } from '@angular/core';

// Services
import { ContentApi } from '../../providers/content.provider';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';
import { AppRoutes } from '../../app.routes';

// SEO
import { HomeMetaTagsDirective } from './home-meta-tags.directive';
import { HomeStructuredDataDirective } from './home-structured-data.directive';

// Componentes
import { CarouselComponent } from '@components/carousel/carousel.component';
import { HomeHeroComponent } from '@components/home-hero/home-hero.component';
import { LiteraryWorksCardDeck } from '@components/literary-works-card-deck/literary-works-card-deck';
import { CarouselSkeletonComponent } from '@components/carousel/carousel-skeleton.component';
import { CollectionTeasersDeck } from '@components/collection-teasers-deck/collection-teasers-deck';
import { HighlightedAuthorsComponent } from '@components/highlighted-authors/highlighted-authors.component';
import { SectionHeaderComponent, type SectionHeaderAction } from '@components/section-header/section-header.component';

@Component({
	selector: 'cuentoneta-home',
	templateUrl: './home.component.html',
	imports: [
		CarouselComponent,
		HomeHeroComponent,
		LiteraryWorksCardDeck,
		CarouselSkeletonComponent,
		CollectionTeasersDeck,
		HighlightedAuthorsComponent,
		SectionHeaderComponent,
	],
	hostDirectives: [HomeMetaTagsDirective, HomeStructuredDataDirective],
})
export default class HomeComponent {
	// Services
	private readonly contentService = inject(ContentApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	// Las dos secciones de obras comparten destino porque comparten hub: no hay una vista filtrada de
	// novedades ni de más leídas a la que llevar.
	protected readonly literaryWorksAction: SectionHeaderAction = {
		link: ['/', AppRoutes.LiteraryWork],
		accessibleSuffix: 'el catálogo de obras',
	};

	// Recursos
	private readonly landingPageResource = ssrBlockingRxResource({
		stream: () => this.contentService.getLandingPageContent(),
		defaultValue: undefined,
	});

	// Propiedades
	// `value()` lanza cuando el recurso quedó en error, así que se lee solo cuando hay valor: sin esta
	// guarda, el fallo del backend rompe el render en vez de mostrar su mensaje.
	private readonly landingPageContent = computed(() =>
		this.landingPageResource.hasValue() ? this.landingPageResource.value() : undefined,
	);
	// El recurso bloquea el SSR, así que en el HTML servido esto ya es falso: los decks salen con su
	// contenido y no con esqueletos. En el cliente cubre la navegación entrante.
	protected readonly isLoading = computed(() => this.landingPageResource.isLoading());
	// El bloqueo del SSR se libera también cuando el stream falla, y ahí el contenido llega vacío. Sin
	// distinguir el fallo, la página afirmaría que no hay obras esta semana cuando lo que pasó es que no
	// se pudo averiguar.
	protected readonly failed = computed(() => this.landingPageResource.status() === 'error');
	// Los topes de cada sección los aplica la página y no el backend, que sirve la tirada completa.
	protected readonly collections = computed(() => this.landingPageContent()?.collections.slice(0, 4) || []);
	protected readonly campaigns = computed(() => this.landingPageContent()?.campaigns || []);
	protected readonly mostRead = computed(() => this.landingPageContent()?.mostRead.slice(0, 6) || []);
	protected readonly latestReads = computed(() => this.landingPageContent()?.latestReads.slice(0, 6) || []);
	protected readonly highlightedAuthors = computed(() => this.landingPageContent()?.highlightedAuthors ?? []);

	// TODO(#2414): vuelve junto con la muestra de portadas del hero.
	// Solo las colecciones con portada editorial propia: las que caen en `sample` prestan las portadas de
	// sus obras, y esas ya se ven más abajo en la página. Sin ninguna, la banda va sin portadas.
	// protected readonly heroCovers = computed(() =>
	// 	this.collections()
	// 		.flatMap((collection) => (collection.imagery.kind === 'representative' ? [collection.imagery.image] : []))
	// 		.slice(0, 3),
	// );

	// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página, y la página
	// de inicio es la más rastreada del sitio.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.landingPageResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});
}
