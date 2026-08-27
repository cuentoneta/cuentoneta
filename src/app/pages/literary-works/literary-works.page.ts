import { Component, computed, effect, forwardRef, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ssrBlockingRxResource } from '@app-utils/ssr-resource';

import { AppRoutes } from '../../app.routes';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { LITERARY_WORKS_HOST, type LiteraryWorksHost } from './literary-works-host';
import { LiteraryWorksMetaTagsDirective } from './literary-works-meta-tags.directive';
import { LiteraryWorksStructuredDataDirective } from './literary-works-structured-data.directive';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-literary-works',
	template: `
		<main class="mx-auto mt-header-height flex w-full max-w-310 flex-col gap-12 px-4 pt-8 pb-16">
			<h1 class="font-inter text-2xl leading-8 font-bold text-neutral-900">{{ headline() }}</h1>

			@if (failed()) {
				<p class="font-inter text-base text-neutral-700" role="alert" data-testid="catalog-error">
					No pudimos cargar las obras. Probá de nuevo en un rato.
				</p>
			} @else if (loading() || literaryWorks().length > 0) {
				<div class="overflow-x-auto rounded-lg border border-neutral-200">
					<table class="w-full border-collapse">
						<thead class="bg-neutral-50">
							<tr class="border-b border-neutral-200">
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Título</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Autor</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Tiempo de lectura</th>
							</tr>
						</thead>
						@if (loading()) {
							<tbody class="divide-y divide-neutral-200" aria-busy="true" aria-label="Cargando obras">
								@for (placeholder of [1, 2, 3, 4]; track placeholder) {
									<tr data-testid="skeleton">
										@for (cell of [1, 2, 3]; track cell) {
											<td class="px-6 py-4">
												<cuentoneta-skeleton appearance="line" class="h-5 w-full max-w-48 bg-neutral-300" />
											</td>
										}
									</tr>
								}
							</tbody>
						} @else {
							<tbody class="divide-y divide-neutral-200" data-testid="literary-works">
								@for (literaryWork of literaryWorks(); track literaryWork.slug) {
									<tr class="transition-colors hover:bg-neutral-50">
										<td class="px-6 py-4">
											<a
												[routerLink]="['/', appRoutes.Read, literaryWork.slug]"
												class="text-blue-600 hover:text-blue-800 hover:underline"
											>
												{{ literaryWork.title }}
											</a>
										</td>
										<td class="px-6 py-4 text-neutral-700">
											@for (author of literaryWork.authors; track author.slug) {
												<a
													[routerLink]="['/', appRoutes.Author, author.slug]"
													class="text-blue-600 hover:text-blue-800 hover:underline"
												>
													{{ author.name }}
												</a>
												@if (!$last) {
													<span>, </span>
												}
											}
										</td>
										<td class="px-6 py-4 text-neutral-700">{{ literaryWork.totalReadingTime }} min</td>
									</tr>
								}
							</tbody>
						}
					</table>
				</div>
			} @else {
				<p class="font-inter text-base text-neutral-700" data-testid="catalog-empty">
					Todavía no hay obras publicadas.
				</p>
			}
		</main>
	`,
	providers: [{ provide: LITERARY_WORKS_HOST, useExisting: forwardRef(() => LiteraryWorksPage) }],
	hostDirectives: [LiteraryWorksMetaTagsDirective, LiteraryWorksStructuredDataDirective],
	imports: [RouterLink, SkeletonComponent],
})
export default class LiteraryWorksPage implements LiteraryWorksHost {
	protected readonly appRoutes = AppRoutes;

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

	// El conteo solo se enuncia cuando hay catálogo resuelto detrás: anunciarlo mientras carga o tras un
	// fallo afirmaría que no hay obras, que es justo lo que la rama de error existe para desmentir.
	protected readonly headline = computed(() => {
		if (this.loading() || this.failed()) {
			return 'Obras';
		}
		const total = this.literaryWorks().length;
		return `${total} ${total === 1 ? 'Obra' : 'Obras'}`;
	});

	// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página. No hay
	// rama 404 — un catálogo no deja de existir.
	private readonly respondErrorStatusEffect = effect(() => {
		if (!this.catalogResource.error() || !this.responseInit) {
			return;
		}
		this.responseInit.status = 503;
	});
}
