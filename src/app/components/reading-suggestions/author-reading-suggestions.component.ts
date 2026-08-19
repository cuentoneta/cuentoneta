import { Component, computed, inject, input } from '@angular/core';
import { map } from 'rxjs';

import { AppRoutes } from '../../app.routes';
import { StoryApi } from '../../providers/story.provider';
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { ReadingSuggestionsListComponent } from './reading-suggestions-list.component';
import { pickReadingSuggestions } from './pick-reading-suggestions';
import type { NavigationParams } from '@app-utils/navigation-params';
import { adaptStoryTeasersToReadingSuggestions } from './story-teaser-to-reading-suggestion.adapter';

/**
 * Sugerencias de otras obras del mismo autor. Es una de las dos variantes que monta
 * ReadingSuggestions: resuelve los datos y delega la presentación en ReadingSuggestionsList.
 *
 * TODO(#2036): cambiar el provider de Story a LiteraryWork cuando la página de lectura integre la tríada.
 *
 * Consume la proyección de teaser y no la de navegación: es la que transporta el cuerpo recortado del
 * que sale el extracto. La de navegación proyecta `body: []` a propósito, porque la comparten la
 * landing y las navegaciones de autor y colección, que no lo necesitan.
 *
 * El recurso es deliberadamente progresivo (no bloquea el SSR): quien lo consume monta el bloque
 * dentro de un `@defer (on viewport)`, así el fetch ocurre una sola vez y ya en el cliente.
 */
@Component({
	selector: 'cuentoneta-author-reading-suggestions',
	imports: [ReadingSuggestionsListComponent],
	host: { class: 'block' },
	template: `
		<cuentoneta-reading-suggestions-list
			[heading]="heading()"
			[teasers]="suggestions()"
			[loading]="loading()"
			[moreLabel]="moreLabel()"
			[moreRoute]="moreRoute()"
			[navigationParams]="navigationParams()"
		/>
	`,
})
export class AuthorReadingSuggestionsComponent {
	// Inputs
	public readonly authorSlug = input.required<string>();
	public readonly authorName = input.required<string>();
	public readonly currentWorkSlug = input<string>();

	private readonly appRoutes = AppRoutes;
	private readonly storyService = inject(StoryApi);

	// El sorteo ocurre acá, en el stream, y no en un computed: así se resuelve una sola vez por fetch
	// y las sugerencias no se rebarajan ante cualquier reevaluación.
	private readonly suggestionsResource = progressiveRxResource({
		// La obra en lectura entra en los params: al pasar a otra obra del mismo autor, el bloque
		// vuelve a resolverse en vez de seguir sugiriendo la que se está leyendo.
		params: () =>
			this.authorSlug() ? { slug: this.authorSlug(), currentWorkSlug: this.currentWorkSlug() } : undefined,
		stream: ({ params }) =>
			this.storyService
				.getByAuthorSlug(params.slug)
				.pipe(
					map((stories) =>
						adaptStoryTeasersToReadingSuggestions(pickReadingSuggestions(stories, params.currentWorkSlug)),
					),
				),
		defaultValue: [],
	});

	protected readonly loading = computed(() => this.suggestionsResource.isLoading());
	// Si el fetch falla, el bloque se queda sin sugerencias y desaparece: es contenido accesorio al
	// pie de la lectura, no vale interrumpirla con un error. `hasValue()` evita que el recurso
	// relance la falla al leer el valor.
	protected readonly suggestions = computed(() =>
		this.suggestionsResource.hasValue() ? this.suggestionsResource.value() : [],
	);
	protected readonly heading = computed(() => `Más obras de ${this.authorName()}`);
	protected readonly moreLabel = computed(() => `Ver más de ${this.authorName()}`);
	protected readonly moreRoute = computed(() => ['/', this.appRoutes.Author, this.authorSlug()]);
	protected readonly navigationParams = computed<NavigationParams>(() => ({
		navigation: 'author',
		navigationSlug: this.authorSlug(),
	}));
}
