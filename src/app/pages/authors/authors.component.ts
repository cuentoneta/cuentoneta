import { Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { AuthorApi } from '../../providers/author-api.interface';
import type { AuthorTeaser } from '@models/author.model';
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';
import { RouterLink } from '@angular/router';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'cuentoneta-authors',
	imports: [RouterLink, NgOptimizedImage],
	hostDirectives: [HeadMetadataDirective],
	template: `
		<main class="content vertical-layout-spacing horizontal-layout-spacing">
			<article class="grid grid-cols-1 gap-8">
				<section class="flex flex-col gap-4">
					<h1 class="font-inter text-xl font-bold">Índice de autores</h1>
					<p class="font-inter text-base text-neutral-600">
						Explorá el índice completo de autores disponible en La Cuentoneta
					</p>
				</section>

				<div class="overflow-x-auto rounded-lg border border-neutral-200">
					<table class="w-full border-collapse">
						<thead class="bg-neutral-50">
							<tr class="border-b border-neutral-200">
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Nombre</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Nacionalidad</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Años</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-neutral-200">
							@for (author of authors(); track author.slug) {
								<tr class="transition-colors hover:bg-neutral-50">
									<td class="px-6 py-4">
										<a
											[routerLink]="['/', appRoutes.Author, author.slug]"
											class="text-blue-600 hover:text-blue-800 hover:underline"
										>
											{{ author.name }}
										</a>
									</td>
									<td class="px-6 py-4 text-neutral-700">
										<span class="flex items-center gap-2">
											@if (author.nationality.flag) {
												<img [ngSrc]="author.nationality.flag" width="20" height="15" class="rounded" alt="" />
											}
											{{ author.nationality.country }}
										</span>
									</td>
									<td class="px-6 py-4 text-neutral-700">{{ lifespanOf(author) }}</td>
								</tr>
							}
						</tbody>
					</table>
				</div>
			</article>
		</main>
	`,
})
export default class AuthorsComponent {
	protected readonly appRoutes = AppRoutes;
	private readonly authorService = inject(AuthorApi);
	private readonly metaTagsDirective = inject(HeadMetadataDirective);

	private readonly authorsResource = ssrBlockingRxResource({
		stream: () => this.authorService.getAll(),
		defaultValue: [],
	});

	// El `order(name asc)` de GROQ compara por punto de código, así que manda al final del listado a
	// todo nombre que empiece con acento o eñe (`Í` > `Z`). Sanity no expone una colación con plegado
	// de acentos, así que el orden alfabético real se resuelve acá, sobre el resultado ya traído.
	private readonly collator = new Intl.Collator('es');

	// Se recorta antes de comparar porque hay fichas con un espacio al inicio del nombre, y el espacio
	// ordena antes que cualquier letra: sin esto, esos autores encabezan el índice. Es defensa contra
	// el dato, no su arreglo — la ficha sigue guardando el nombre con el espacio.
	protected readonly authors = computed(() =>
		[...this.authorsResource.value()].sort((first, second) =>
			this.collator.compare(first.name.trim(), second.name.trim()),
		),
	);

	// El corpus mezcla autores históricos con contemporáneos, así que la celda tiene que servir a
	// una ficha completa, a una con solo el nacimiento y a una sin ninguna de las dos fechas.
	protected lifespanOf(author: AuthorTeaser): string {
		if (!author.bornOnYear) {
			return '—';
		}
		return author.diedOnYear ? `${author.bornOnYear}–${author.diedOnYear}` : `${author.bornOnYear}–`;
	}

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Todas las Autoras y Autores - La Cuentoneta');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('authors'));
		this.metaTagsDirective.setRobots('noindex, follow');
	}
}
