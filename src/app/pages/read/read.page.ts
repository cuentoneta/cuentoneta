// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

// Models
import { createAttributedText } from '@models/attributed-text.model';

// Services
import { LiteraryWorkApi } from '../../providers/literary-work-api.interface';

// SEO
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { AppRoutes } from '../../app.routes';
import { READ_HOST, type ReadHost } from './read-host';

// Components
import { LiteraryWorkHeroHeaderComponent } from '@components/literary-work-hero-header/literary-work-hero-header.component';
import { ButtonComponent } from '@components/button/button.component';
import { EditorialNoteComponent } from '@components/editorial-note/editorial-note.component';

@Component({
	selector: 'cuentoneta-read',
	templateUrl: './read.page.html',
	providers: [{ provide: READ_HOST, useExisting: forwardRef(() => ReadPage) }],
	hostDirectives: [HeadMetadataDirective],
	imports: [LiteraryWorkHeroHeaderComponent, ButtonComponent, EditorialNoteComponent],
})
export default class ReadPage implements ReadHost {
	public readonly slug = input.required<string>();

	private readonly literaryWorkApi = inject(LiteraryWorkApi);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
	private readonly head = inject(HeadMetadataDirective);

	private readonly literaryWorkResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.literaryWorkApi.getBySlug(params),
		defaultValue: undefined,
	});

	public readonly literaryWork = computed(() =>
		this.literaryWorkResource.hasValue() ? this.literaryWorkResource.value() : undefined,
	);

	protected readonly notFound = computed(() => this.literaryWorkResource.status() === 'error');
	protected readonly byline = computed(
		() =>
			this.literaryWork()
				?.authors.map((author) => author.name)
				.join(', ') ?? '',
	);

	// `/read/:slug` es una ruta accesible nueva que todavía no queremos exponer a buscadores: se sirve
	// `noindex, nofollow` y sin JSON-LD. El robots se emite antes del guard a propósito, para que la
	// señal salga también cuando la obra no carga.
	// TODO: al implementar la página de lectura V3, revertir este opt-out — volver a marcar la página
	// indexable y re-conectar ReadMetaTagsDirective/ReadStructuredDataDirective en `hostDirectives`.
	private readonly applyHeadMetadataEffect = effect(() => {
		this.head.setRobots('noindex, nofollow');
		const literaryWork = this.literaryWork();
		if (!literaryWork) {
			return;
		}
		untracked(() => {
			this.head.setTitle(`${literaryWork.title} - ${this.byline()}`);
			// TODO: Revisar textos definitivos a la hora de implementar la página de lectura V3
			this.head.setDescription(
				'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Read}/${literaryWork.slug}`));
		});
	});

	// El HTML ya viene saneado del backend (única fuente: el pipeline del ACL); bypass es la
	// confianza en esa frontera, no una sanitización propia — LITERARY_WORK_DESIGN.md §9.
	// TODO: Mover esta lógica a un service como parte de la implementación de #1471.
	// 1. Chequear de qué manera evitar el uso de bypassSecurityTrustHtml
	// 2. Revisar si hace falta declarar tipos para rendering (RenderableEpigraph, RenderableSection, etc.)
	protected readonly sections = computed(
		() =>
			this.literaryWork()?.content.map((section) => ({
				position: section.position,
				anchor: section.title?.toAnchor(),
				title: section.title?.value,
				epigraphs:
					section.epigraphs?.map((epigraph) => ({
						text: this.sanitizer.bypassSecurityTrustHtml(epigraph.text),
						reference: epigraph.reference ? this.sanitizer.bypassSecurityTrustHtml(epigraph.reference) : undefined,
					})) ?? [],
				bodyHtml: this.sanitizer.bypassSecurityTrustHtml(section.bodyHtml),
			})) ?? [],
	);

	protected readonly editorialNote = computed(() => {
		const editorialNote = this.literaryWork()?.editorialNote;
		return editorialNote ? createAttributedText({ text: editorialNote }) : undefined;
	});

	// El estado de error se renderiza siempre igual ("No encontramos esta obra"), pero un 404 real y
	// un backend caído no son lo mismo para el borde ni para el crawler: si un fallo transitorio
	// saliera 200, el CDN lo cachearía como si fuera contenido —sin purga que lo desaloje— y el
	// crawler lo leería como soft-404.
	private readonly respondErrorStatusEffect = effect(() => {
		const error = this.literaryWorkResource.error();
		if (error === undefined || !this.responseInit) {
			return;
		}

		this.responseInit.status = error instanceof HttpErrorResponse && error.status === 404 ? 404 : 503;
	});
}
