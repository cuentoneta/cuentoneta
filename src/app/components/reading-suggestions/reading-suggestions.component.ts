import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
	LiteraryWorkCardTeaserComponent,
	type LiteraryWorkCardTeaserContent,
} from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import { ButtonComponent } from '@components/button/button.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Bloque "qué leer después" que cierra la lectura de una obra: un encabezado, una tríada de obras
 * sugeridas y un acceso al listado completo.
 *
 * Es presentacional puro — recibe las obras ya resueltas y no conoce ningún provider. Quienes las
 * consiguen son los wrappers conectados (AuthorReadingSuggestions / CollectionReadingSuggestions).
 */
@Component({
	selector: 'cuentoneta-reading-suggestions',
	imports: [RouterLink, LiteraryWorkCardTeaserComponent, ButtonComponent, SkeletonComponent],
	host: { class: 'block' },
	template: `
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
			<ul class="flex flex-col divide-y divide-neutral-200 [&>li]:py-6 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0">
				@for (literaryWork of displayedTeasers(); track $index) {
					<li>
						<cuentoneta-literary-work-card-teaser
							[literaryWork]="literaryWork"
							[showAuthor]="showAuthor()"
							[tagLabel]="tagLabel()"
							variant="on-gray"
							showMultimedia
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
	`,
})
export class ReadingSuggestionsComponent {
	// Inputs
	public readonly heading = input<string>('');
	public readonly teasers = input<readonly LiteraryWorkCardTeaserContent[]>([]);
	public readonly loading = input<boolean>(false);
	public readonly moreLabel = input<string>('');
	public readonly moreRoute = input<string | readonly string[]>();
	public readonly showAuthor = input<boolean>(false);
	public readonly tagLabel = input<string>();

	// Cantidad de sugerencias del bloque: fija el alto del estado de carga para que no haya salto de
	// layout cuando llegan las obras.
	private readonly suggestionCount = 3;
	private readonly loadingPlaceholders: undefined[] = Array(this.suggestionCount);

	// Sin obra, la tarjeta renderiza su propio esqueleto: el estado de carga es la misma lista con
	// los slots vacíos.
	protected readonly displayedTeasers = computed<readonly (LiteraryWorkCardTeaserContent | undefined)[]>(() =>
		this.loading() ? this.loadingPlaceholders : this.teasers(),
	);
}
