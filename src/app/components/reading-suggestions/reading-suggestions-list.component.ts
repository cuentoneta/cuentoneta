import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
	LiteraryWorkCardTeaserComponent,
	type LiteraryWorkCardTeaserContent,
} from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { ButtonComponent } from '@components/button/button.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import type { NavigationParams } from '@app-utils/navigation-params';

/**
 * Bloque "qué leer después" que cierra la lectura de una obra: un encabezado, una tríada de obras
 * sugeridas y un acceso al listado completo.
 *
 * Es presentacional puro — recibe las obras ya resueltas y no conoce ningún provider. Quienes las
 * consiguen son los wrappers conectados (AuthorReadingSuggestions / CollectionReadingSuggestions).
 */
@Component({
	selector: 'cuentoneta-reading-suggestions-list',
	imports: [RouterLink, LiteraryWorkCardTeaserComponent, ButtonComponent, SkeletonComponent],
	host: { class: 'block' },
	template: `
		<!-- Sin sugerencias que ofrecer no hay bloque: un encabezado y un botón sobre una lista vacía
			 prometen algo que no existe. Cubre además el fallo del fetch, que resuelve en lista vacía. -->
		@if (loading() || teasers().length > 0) {
			<section
				[attr.aria-busy]="loading()"
				data-testid="reading-suggestions"
				class="flex w-full flex-col gap-6 rounded-2xl bg-neutral-100 p-6 md:p-10"
			>
				@if (loading()) {
					<cuentoneta-skeleton appearance="line" class="h-7 w-full max-w-72 bg-neutral-300" />
				} @else {
					<h2 class="h3 text-neutral-900">{{ heading() }}</h2>
				}

				<!-- Los divisores y el espaciado viven en el contenedor: valen igual para las tarjetas reales y
				 para los esqueletos, sin duplicar la regla en cada rama. -->
				<ul
					class="flex flex-col divide-y divide-neutral-200 [&>li]:py-6 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0"
				>
					<!-- Se trackea por índice a propósito: el estado de carga ocupa los mismos slots con obras
						 vacías, y trackear por slug destruiría y recrearía cada tarjeta al llegar los datos. -->
					@for (literaryWork of displayedTeasers(); track $index) {
						<li>
							<!-- La etiqueta es el tipo literario de la obra, que el corpus deja primero entre sus tags. -->
							<cuentoneta-literary-work-card-teaser
								[literaryWork]="literaryWork"
								[navigationParams]="navigationParams()"
								[showAuthor]="showAuthor()"
								[tagLabel]="literaryWork?.tags?.[0]?.title"
								[showExcerpt]="true"
								[showMultimedia]="true"
								variant="on-gray"
							/>
						</li>
					}
				</ul>

				@if (loading()) {
					<cuentoneta-skeleton appearance="line" class="h-11 w-full max-w-56 rounded-full bg-neutral-300" />
				} @else if (moreRoute()) {
					<a [routerLink]="moreRoute()" cuentoneta-button type="outline" class="self-start">{{ moreLabel() }}</a>
				}
			</section>
		}
	`,
})
export class ReadingSuggestionsListComponent {
	// Inputs
	public readonly heading = input<string>('');
	public readonly teasers = input<readonly LiteraryWorkCardTeaserContent[]>([]);
	public readonly loading = input<boolean>(false);
	public readonly moreLabel = input<string>('');
	public readonly moreRoute = input<string | readonly string[]>();
	public readonly showAuthor = input<boolean>(false);
	// Contexto de navegación que arrastra cada enlace, para que el bloque de la obra destino se
	// resuelva en el mismo contexto (autor o colección) desde el que se llegó.
	public readonly navigationParams = input<NavigationParams>();

	// El estado de carga reserva el alto de la misma cantidad de tarjetas que se van a renderizar,
	// para que no haya salto de layout cuando llegan las obras.
	private readonly loadingPlaceholders: undefined[] = Array(READING_SUGGESTIONS_COUNT);

	// Sin obra, la tarjeta renderiza su propio esqueleto: el estado de carga es la misma lista con
	// los slots vacíos.
	protected readonly displayedTeasers = computed<readonly (LiteraryWorkCardTeaserContent | undefined)[]>(() =>
		this.loading() ? this.loadingPlaceholders : this.teasers(),
	);
}
