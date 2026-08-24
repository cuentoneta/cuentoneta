// Core
import { Component, computed, effect, forwardRef, inject, input, RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

// Models
import { createAttributedText } from '@models/attributed-text.model';

// Services
import { LiteraryWorkApi } from '../../providers/literary-work.provider';

// SEO
import { ReadMetaTagsDirective } from './read-meta-tags.directive';
import { ReadStructuredDataDirective } from './read-structured-data.directive';
import { READ_HOST, type ReadHost } from './read-host';

// Components
import { LiteraryWorkHeroHeaderComponent } from '@components/literary-work-hero-header/literary-work-hero-header.component';
import { ButtonComponent } from '@components/button/button.component';
import { EditorialNoteComponent } from '@components/editorial-note/editorial-note.component';
import { LiteraryWorkSectionBodyComponent } from '@components/literary-work-section-body/literary-work-section-body.component';
import { MediaWidgetSelector } from '@components/media-widget-selector/media-widget-selector.component';
import { MediaWidgetSelectorSkeleton } from '@components/media-widget-selector/media-widget-selector-skeleton.component';
import { DividerComponent } from '@components/divider/divider.component';
import { ReadingSuggestionsComponent } from '@components/reading-suggestions/reading-suggestions.component';
import { ReadPageSkeleton } from './read-page-skeleton.component';
import { RouterLink } from '@angular/router';
import { toNavigationContext, type NavigationContext, type NavigationParams } from '@app-utils/navigation-params';

@Component({
	selector: 'cuentoneta-read',
	templateUrl: './read.page.html',
	providers: [{ provide: READ_HOST, useExisting: forwardRef(() => ReadPage) }],
	hostDirectives: [ReadMetaTagsDirective, ReadStructuredDataDirective],
	imports: [
		LiteraryWorkHeroHeaderComponent,
		ButtonComponent,
		DividerComponent,
		EditorialNoteComponent,
		LiteraryWorkSectionBodyComponent,
		MediaWidgetSelector,
		MediaWidgetSelectorSkeleton,
		ReadPageSkeleton,
		ReadingSuggestionsComponent,
		RouterLink,
	],
})
export default class ReadPage implements ReadHost {
	public readonly slug = input.required<string>();

	/** Contexto con el que se entró a la obra. Decide qué sugerencias se ofrecen al pie. */
	public readonly navigation = input<NavigationContext, string | undefined>('author', {
		transform: toNavigationContext,
	});

	public readonly navigationSlug = input<string>();

	private readonly literaryWorkApi = inject(LiteraryWorkApi);
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

	// El primer autor y no el `byline`: el nombre y el slug que consume la variante de autor tienen
	// que referirse al mismo, y el byline une a todos con coma.
	private readonly primaryAuthor = computed(() => this.literaryWork()?.authors[0]);

	protected readonly primaryAuthorName = computed(() => this.primaryAuthor()?.name ?? '');

	// Sin contexto en la ruta se cae al autor de la obra: una obra abierta por URL directa igual
	// ofrece a dónde seguir leyendo.
	protected readonly navigationParams = computed<NavigationParams>(() => {
		const navigationSlug = this.navigationSlug();

		if (navigationSlug) {
			return { navigation: this.navigation(), navigationSlug };
		}

		return { navigation: 'author', navigationSlug: this.primaryAuthor()?.slug ?? '' };
	});
	protected readonly byline = computed(
		() =>
			this.literaryWork()
				?.authors.map((author) => author.name)
				.join(', ') ?? '',
	);

	// TODO(#1471): mover esta lógica a un service y revisar si hace falta declarar tipos de rendering.
	protected readonly sections = computed(
		() =>
			this.literaryWork()?.content.map((section) => ({
				position: section.position,
				anchor: section.title?.toAnchor(),
				title: section.title?.value,
				epigraphs: section.epigraphs ?? [],
				bodyHtml: section.bodyHtml,
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
