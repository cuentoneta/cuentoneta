// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

// Utils
import { ssrBlockingRxResource } from '@utils/ssr-resource';

// Services
import { LiteraryWorkApi } from '../../providers/literary-work-api.interface';

// SEO
import { ReadMetaTagsDirective } from './read-meta-tags.directive';
import { ReadStructuredDataDirective } from './read-structured-data.directive';
import { READ_HOST, type ReadHost } from './read-host';

interface RenderableEpigraph {
	readonly text: SafeHtml;
	readonly reference?: SafeHtml;
}

interface RenderableSection {
	readonly position: number;
	readonly anchor?: string;
	readonly chapterTitle?: string;
	readonly epigraphs: readonly RenderableEpigraph[];
	readonly bodyHtml: SafeHtml;
}

@Component({
	selector: 'cuentoneta-read',
	templateUrl: './read.component.html',
	providers: [{ provide: READ_HOST, useExisting: forwardRef(() => ReadComponent) }],
	hostDirectives: [ReadMetaTagsDirective, ReadStructuredDataDirective],
})
export default class ReadComponent implements ReadHost {
	public readonly slug = input.required<string>();

	private readonly literaryWorkApi = inject(LiteraryWorkApi);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	private readonly literaryWorkResource = ssrBlockingRxResource({
		params: this.slug,
		stream: ({ params }) => this.literaryWorkApi.getBySlug(params),
		defaultValue: undefined,
	});

	// value() lanza cuando el resource está en error: hasValue() lo desambigua sin try/catch.
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
	protected readonly sections = computed<readonly RenderableSection[]>(
		() =>
			this.literaryWork()?.content.map((section) => ({
				position: section.position,
				anchor: section.chapterTitle?.toAnchor(),
				chapterTitle: section.chapterTitle?.value,
				epigraphs:
					section.epigraphs?.map((epigraph) => ({
						text: this.sanitizer.bypassSecurityTrustHtml(epigraph.text),
						reference: epigraph.reference ? this.sanitizer.bypassSecurityTrustHtml(epigraph.reference) : undefined,
					})) ?? [],
				bodyHtml: this.sanitizer.bypassSecurityTrustHtml(section.bodyHtml),
			})) ?? [],
	);

	// Una URL inexistente responde 404 real de HTTP en SSR, no 200 con contenido vacío
	// (el hueco de indexación documentado para páginas SSR) — LITERARY_WORK_DESIGN.md §7.
	private readonly respondNotFoundEffect = effect(() => {
		const error = this.literaryWorkResource.error();
		if (error instanceof HttpErrorResponse && error.status === 404 && this.responseInit) {
			this.responseInit.status = 404;
		}
	});
}
