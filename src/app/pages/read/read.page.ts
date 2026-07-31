// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

// Services
import { LiteraryWorkApi } from '../../providers/literary-work-api.interface';

// SEO
import { ReadMetaTagsDirective } from './read-meta-tags.directive';
import { ReadStructuredDataDirective } from './read-structured-data.directive';
import { READ_HOST, type ReadHost } from './read-host';

// Components
import { LiteraryWorkHeroHeaderComponent } from '@components/literary-work-hero-header/literary-work-hero-header.component';
import { ButtonComponent } from '@components/button/button.component';

@Component({
	selector: 'cuentoneta-read',
	templateUrl: './read.page.html',
	providers: [{ provide: READ_HOST, useExisting: forwardRef(() => ReadPage) }],
	hostDirectives: [ReadMetaTagsDirective, ReadStructuredDataDirective],
	imports: [LiteraryWorkHeroHeaderComponent, ButtonComponent],
})
export default class ReadPage implements ReadHost {
	public readonly slug = input.required<string>();

	private readonly literaryWorkApi = inject(LiteraryWorkApi);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

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

	private readonly respondNotFoundEffect = effect(() => {
		const error = this.literaryWorkResource.error();
		if (error instanceof HttpErrorResponse && error.status === 404 && this.responseInit) {
			this.responseInit.status = 404;
		}
	});
}
