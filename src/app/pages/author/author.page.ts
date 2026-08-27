// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

// Services
import { AuthorApi } from '../../providers/author.provider';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';

// SEO
import { AUTHOR_HOST, type AuthorHost } from './author-host';
import { AuthorMetaTagsDirective } from './author-meta-tags.directive';
import { AuthorStructuredDataDirective } from './author-structured-data.directive';

// Components
import { AuthorInfoPanelComponent } from '@components/author-info-panel/author-info-panel.component';
import { DividerComponent } from '@components/divider/divider.component';
import { DrawerComponent } from '@components/drawer/drawer.component';
import { LiteraryWorkCardTeaserComponent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { ResourceComponent } from '@components/resource/resource.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-author',
	templateUrl: './author.page.html',
	providers: [{ provide: AUTHOR_HOST, useExisting: forwardRef(() => AuthorPage) }],
	hostDirectives: [AuthorMetaTagsDirective, AuthorStructuredDataDirective],
	imports: [
		AuthorInfoPanelComponent,
		DividerComponent,
		DrawerComponent,
		LiteraryWorkCardTeaserComponent,
		NgTemplateOutlet,
		ResourceComponent,
		SkeletonComponent,
	],
})
export default class AuthorPage implements AuthorHost {
	public readonly slug = input.required<string>();

	private readonly authorApi = inject(AuthorApi);
	private readonly literaryWorkApi = inject(LiteraryWorkApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	// Gatea la creación del contenido del panel deslizable: sin esto, la biografía entera y los enlaces
	// a los recursos viajarían en el HTML del servidor, duplicando lo que la columna ya muestra.
	protected readonly isBiographyDrawerOpen = signal(false);

	// Los 160 px que el diseño reserva para la biografía en la columna, sobre un interlineado de 20.
	protected readonly sidebarBiographyLines = 8;

	// Los dos recursos bloquean el render del servidor: el nombre, la biografía y los enlaces a las obras
	// son las invariantes que la página tiene que servir indexadas, y con un recurso progresivo el HTML se
	// serializa antes de la respuesta.
	private readonly authorResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.authorApi.getBySlug(params),
		defaultValue: undefined,
	});

	private readonly literaryWorksResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.literaryWorkApi.getTeasers({ author: params }),
		defaultValue: [],
	});

	public readonly author = computed(() => (this.authorResource.hasValue() ? this.authorResource.value() : undefined));
	// El guard no es ceremonia: leer el valor de un recurso en error relanza la falla, y acá el throw
	// saldría dentro del encabezado y del listado, derribando el render del servidor de una página
	// indexable. Un catálogo que falla con el autor resuelto deja la ficha sin obras, no sin página.
	protected readonly literaryWorks = computed(() =>
		this.literaryWorksResource.hasValue() ? this.literaryWorksResource.value() : [],
	);
	protected readonly notFound = computed(() => this.authorResource.status() === 'error');

	// Un fallo transitorio no puede salir 200: el borde cachearía una página vacía como si fuera la ficha
	// del autor. Solo la ausencia real del autor es un 404.
	private readonly respondErrorStatusEffect = effect(() => {
		const error = this.authorResource.error();
		if (!error || !this.responseInit) {
			return;
		}
		this.responseInit.status = error instanceof HttpErrorResponse && error.status === 404 ? 404 : 503;
	});

	protected readonly literaryWorksHeading = computed(() => {
		const total = this.literaryWorks().length;
		return `${total} ${total === 1 ? 'obra' : 'obras'}`;
	});

	protected openBiographyDrawer(drawer: DrawerComponent): void {
		this.isBiographyDrawerOpen.set(true);
		drawer.open();
	}
}
