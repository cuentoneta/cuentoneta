// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';

// Services
import { AuthorApi } from '../../providers/author.provider';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';

// SEO
import { AUTHOR_HOST, type AuthorHost } from './author-host';
import { AuthorMetaTagsDirective } from './author-meta-tags.directive';
import { AuthorStructuredDataDirective } from './author-structured-data.directive';

// Components
import { AuthorInfoPanel } from '@components/author-info-panel/author-info-panel';
import { Divider } from '@components/divider/divider';
import { Drawer } from '@components/drawer/drawer';
import { LiteraryWorkTeaserCard } from '@components/literary-work-teaser-card/literary-work-teaser-card';
import { Resource } from '@components/resource/resource';
import { Skeleton } from '@components/skeleton/skeleton';

@Component({
	selector: 'cuentoneta-author',
	templateUrl: './author.page.html',
	providers: [{ provide: AUTHOR_HOST, useExisting: forwardRef(() => AuthorPage) }],
	hostDirectives: [AuthorMetaTagsDirective, AuthorStructuredDataDirective],
	imports: [AuthorInfoPanel, Divider, Drawer, LiteraryWorkTeaserCard, NgTemplateOutlet, Resource, Skeleton],
})
export default class AuthorPage implements AuthorHost {
	public readonly slug = input.required<string>();

	private readonly authorApi = inject(AuthorApi);
	private readonly literaryWorkApi = inject(LiteraryWorkApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	// Gatea la creación del contenido del panel deslizable: sin esto, la biografía entera y los enlaces
	// a los recursos viajarían en el HTML del servidor, duplicando lo que la columna ya muestra.
	private readonly isBiographyDrawerOpen = signal(false);

	// Los 160 px que el diseño reserva para la biografía en la columna, sobre un interlineado de 20.
	private readonly sidebarBiographyLines = 8;

	private readonly authorResource = rxResource({
		params: this.slug,
		stream: ({ params }) => this.authorApi.getBySlug(params),
		defaultValue: undefined,
	});

	private readonly literaryWorksResource = rxResource({
		params: this.slug,
		stream: ({ params }) => this.literaryWorkApi.getTeasers({ author: params }),
		defaultValue: [],
	});

	public readonly author = computed(() => (this.authorResource.hasValue() ? this.authorResource.value() : undefined));
	// El guard no es ceremonia: leer el valor de un recurso en error relanza la falla, y acá el throw
	// saldría dentro del encabezado y del listado, derribando el render del servidor de una página
	// indexable. Un catálogo que falla con el autor resuelto deja la ficha sin obras, no sin página.
	private readonly literaryWorks = computed(() =>
		this.literaryWorksResource.hasValue() ? this.literaryWorksResource.value() : [],
	);
	private readonly notFound = computed(() => this.authorResource.status() === 'error');

	// Un fallo transitorio no puede salir 200: el borde cachearía una página vacía como si fuera la ficha
	// del autor. Solo la ausencia real del autor es un 404.
	private readonly respondErrorStatusEffect = effect(() => {
		const error = this.authorResource.error();
		if (!error || !this.responseInit) {
			return;
		}
		this.responseInit.status = error instanceof HttpErrorResponse && error.status === 404 ? 404 : 503;
	});

	private readonly literaryWorksHeading = computed(() => {
		const total = this.literaryWorks().length;
		return `${total} ${total === 1 ? 'obra' : 'obras'}`;
	});

	private openBiographyDrawer(drawer: Drawer): void {
		this.isBiographyDrawerOpen.set(true);
		drawer.open();
	}
}
