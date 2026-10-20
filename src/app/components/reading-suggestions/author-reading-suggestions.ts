import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { AppRoutes } from '../../app.routes';
import { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { ReadingSuggestionsList } from './reading-suggestions-list';
import { EMPTY_READING_SUGGESTIONS } from '@models/reading-suggestions.model';
import type { NavigationParams } from '@app-utils/navigation-params';

/**
 * Sugerencias de otras obras del mismo autor. Es una de las dos variantes que monta
 * ReadingSuggestions: resuelve los datos y delega la presentación en ReadingSuggestionsList.
 *
 * El bloque lo arma el backend —el encabezado con el nombre del autor y las obras ya elegidas—, así que
 * esta variante no selecciona nada: pide las del ámbito y las dibuja.
 *
 * El SSR no lo carga porque quien lo consume monta el bloque dentro de un `@defer (on viewport)`: el
 * fetch ocurre una sola vez, ya en el cliente.
 */
@Component({
	selector: 'cuentoneta-author-reading-suggestions',
	imports: [ReadingSuggestionsList],
	host: { class: 'block' },
	template: `
		<cuentoneta-reading-suggestions-list
			[heading]="heading()"
			[teasers]="suggestions().suggestions"
			[loading]="loading()"
			[moreLabel]="moreLabel()"
			[moreRoute]="moreRoute()"
			[navigationParams]="navigationParams()"
		/>
	`,
})
export class AuthorReadingSuggestions {
	// Inputs
	public readonly authorSlug = input.required<string>();
	public readonly currentWorkSlug = input.required<string>();

	private readonly appRoutes = AppRoutes;
	private readonly literaryWorkService = inject(LiteraryWorkApi);

	private readonly suggestionsResource = rxResource({
		// La obra en lectura entra en los params: al pasar a otra obra del mismo autor, el bloque
		// vuelve a resolverse en vez de seguir sugiriendo la que se está leyendo.
		params: () =>
			this.authorSlug() ? { slug: this.authorSlug(), currentWorkSlug: this.currentWorkSlug() } : undefined,
		stream: ({ params }) => this.literaryWorkService.getSuggestions(params.currentWorkSlug, { author: params.slug }),
		defaultValue: EMPTY_READING_SUGGESTIONS,
	});

	private readonly loading = computed(() => this.suggestionsResource.isLoading());

	// Si el fetch falla, el bloque se queda sin sugerencias y desaparece: es contenido accesorio al
	// pie de la lectura, no vale interrumpirla con un error. `hasValue()` evita que el recurso
	// relance la falla al leer el valor.
	private readonly suggestions = computed(() =>
		this.suggestionsResource.hasValue() ? this.suggestionsResource.value() : EMPTY_READING_SUGGESTIONS,
	);
	private readonly heading = computed(() => `Más obras de ${this.suggestions().title}`);
	private readonly moreLabel = computed(() => `Ver más de ${this.suggestions().title}`);
	private readonly moreRoute = computed(() => ['/', this.appRoutes.Author, this.authorSlug()]);
	private readonly navigationParams = computed<NavigationParams>(() => ({
		navigation: 'author',
		navigationSlug: this.authorSlug(),
	}));
}
