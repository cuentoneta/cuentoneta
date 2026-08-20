import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LiteraryWorkCardTeaserComponent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { ButtonComponent } from '@components/button/button.component';
import { DividerComponent } from '@components/divider/divider.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import type { ReadingSuggestion } from './story-teaser-to-reading-suggestion.adapter';
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
	imports: [RouterLink, LiteraryWorkCardTeaserComponent, ButtonComponent, DividerComponent, SkeletonComponent],
	host: { class: 'block' },
	template: `
		<!-- Sin sugerencias que ofrecer no hay bloque: un encabezado y un botón sobre una lista vacía
			 prometen algo que no existe. Cubre además el fallo del fetch, que resuelve en lista vacía. -->
		@if (loading() || teasers().length > 0) {
			<section
				[attr.aria-busy]="loading()"
				data-testid="reading-suggestions"
				class="flex w-full flex-col gap-10 rounded-2xl bg-neutral-100 p-6 md:p-10"
			>
				@if (loading()) {
					<cuentoneta-skeleton appearance="line" class="h-8 w-full max-w-72 bg-neutral-300" />
				} @else {
					<h2 class="text-2xl font-semibold text-neutral-900">{{ heading() }}</h2>
				}

				<ul class="flex flex-col gap-7">
					<!-- Se trackea por índice a propósito: el estado de carga ocupa los mismos slots con obras
						 vacías, y trackear por slug destruiría y recrearía cada tarjeta al llegar los datos. -->
					@for (suggestion of displayedTeasers(); track $index) {
						<li class="flex flex-col gap-7">
							<!-- La etiqueta es el tipo literario de la obra. Que sea el primer tag es convención editorial del
								 catálogo, no algo que el schema garantice: si el orden cambiara, cambiaría la etiqueta. -->
							<cuentoneta-literary-work-card-teaser
								[literaryWork]="suggestion?.literaryWork"
								[navigationParams]="navigationParams()"
								[showAuthor]="showAuthor()"
								[tagLabel]="suggestion?.literaryWork?.tags?.[0]?.title"
								[excerptParagraphs]="suggestion?.excerptParagraphs ?? []"
								[showExcerpt]="true"
								[excerptLines]="excerptLines()"
								[showMultimedia]="true"
								variant="on-gray"
							/>
							<!-- El divisor va dentro del ítem y no entre ítems porque una lista solo admite ítems como
								 hijos, y decorativo porque la lista ya delimita sus partes: anunciarlo como separador
								 repetiría esa información. El corte por el último es lo que evita el que sobra al final. -->
							@if (!$last) {
								<cuentoneta-divider [decorative]="true" data-testid="suggestion-separator" />
							}
						</li>
					}
				</ul>

				@if (loading()) {
					<cuentoneta-skeleton appearance="line" class="h-11 w-full max-w-56 rounded-full bg-neutral-300" />
				} @else if (moreRoute()) {
					<a [routerLink]="moreRoute()" cuentoneta-button variant="outline" class="self-start">{{ moreLabel() }}</a>
				}
			</section>
		}
	`,
})
export class ReadingSuggestionsListComponent {
	// Inputs
	public readonly heading = input<string>('');
	// TODO(#2037): el bloque transporta la obra y su extracto por separado porque el extracto viene de
	// `Story` en Portable Text. Cuando la tríada consuma obras nativas, vuelve a ser `LiteraryWorkTeaser[]`.
	public readonly teasers = input<readonly ReadingSuggestion[]>([]);
	public readonly loading = input<boolean>(false);
	public readonly moreLabel = input<string>('');
	public readonly moreRoute = input<string | readonly string[]>();
	public readonly showAuthor = input<boolean>(false);
	// Contexto de navegación que arrastra cada enlace, para que el bloque de la obra destino se
	// resuelva en el mismo contexto (autor o colección) desde el que se llegó.
	public readonly navigationParams = input<NavigationParams>();

	// Sin el autor, la tarjeta libera su franja vertical y el extracto puede ocuparla con una línea más.
	protected readonly excerptLines = computed(() => (this.showAuthor() ? 2 : 3));

	// El estado de carga reserva el alto de la misma cantidad de tarjetas que se van a renderizar,
	// para que no haya salto de layout cuando llegan las obras.
	private readonly loadingPlaceholders: undefined[] = Array(READING_SUGGESTIONS_COUNT);

	// Sin obra, la tarjeta renderiza su propio esqueleto: el estado de carga es la misma lista con
	// los slots vacíos.
	protected readonly displayedTeasers = computed<readonly (ReadingSuggestion | undefined)[]>(() =>
		this.loading() ? this.loadingPlaceholders : this.teasers(),
	);
}
