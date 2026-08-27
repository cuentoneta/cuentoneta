import { Component, computed, effect, inject, RESPONSE_INIT } from '@angular/core';

import { ssrBlockingRxResource } from '@app-utils/ssr-resource';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

import { AppRoutes } from '../../app.routes';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { LiteraryWorkCardTeaserComponent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';

@Component({
	selector: 'cuentoneta-literary-works',
	template: `
		<main class="mx-auto mt-header-height flex w-full max-w-310 flex-col gap-12 px-4 pt-8 pb-16">
			<h1 class="font-inter text-2xl leading-8 font-bold text-neutral-900">
				{{ literaryWorks().length }} {{ literaryWorks().length === 1 ? 'Obra' : 'Obras' }}
			</h1>

			@if (loading()) {
				<section class="flex flex-col gap-8" aria-busy="true">
					@for (placeholder of [1, 2, 3, 4]; track placeholder) {
						<cuentoneta-literary-work-card-teaser class="w-full" />
					}
				</section>
			} @else if (failed()) {
				<p class="font-inter text-base text-neutral-700" data-testid="catalog-error">
					No pudimos cargar las obras. Probá de nuevo en un rato.
				</p>
			} @else if (literaryWorks().length > 0) {
				<section class="flex flex-col gap-8" data-testid="literary-works">
					@for (literaryWork of literaryWorks(); track literaryWork.slug) {
						<cuentoneta-literary-work-card-teaser
							[literaryWork]="literaryWork"
							[showAuthor]="true"
							[showExcerpt]="true"
							[showMultimedia]="true"
							class="w-full"
						/>
					}
				</section>
			} @else {
				<p class="font-inter text-base text-neutral-700" data-testid="catalog-empty">
					Todavía no hay obras publicadas.
				</p>
			}
		</main>
	`,
	hostDirectives: [HeadMetadataDirective],
	imports: [LiteraryWorkCardTeaserComponent],
})
export default class LiteraryWorksPage {
	private readonly headMetadata = inject(HeadMetadataDirective);
	private readonly literaryWorkApi = inject(LiteraryWorkApi);
	private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

	private readonly catalogResource = ssrBlockingRxResource({
		stream: () => this.literaryWorkApi.getTeasers(),
		defaultValue: [],
	});

	// El `order(title asc)` de la query compara por punto de código: manda al final todo título con
	// acento o eñe inicial, y Sanity no expone colación con plegado.
	private readonly collator = new Intl.Collator('es');

	public readonly literaryWorks = computed(() => {
		const catalog = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
		return [...catalog].sort((first, second) => this.collator.compare(first.title, second.title));
	});

	protected readonly failed = computed(() => this.catalogResource.status() === 'error');

	protected readonly loading = computed(() => this.catalogResource.isLoading());

	// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página. No hay
	// rama 404 — un catálogo no deja de existir.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.catalogResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});

	constructor() {
		this.headMetadata.setTitle('Obras');
		this.headMetadata.setDescription(
			'Explorá todas las obras publicadas en La Cuentoneta: cuentos, poemas y relatos breves para leer en línea.',
		);
		this.headMetadata.setCanonicalUrl(buildCanonicalUrl(AppRoutes.LiteraryWork));
		this.headMetadata.setRobots('noindex, follow');
	}
}
