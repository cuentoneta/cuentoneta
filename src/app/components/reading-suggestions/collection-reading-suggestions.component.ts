import { Component, computed, inject, input } from '@angular/core';
import { map } from 'rxjs';

import { AppRoutes } from '../../app.routes';
import { StorylistApi } from '../../providers/storylist.provider';
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { ReadingSuggestionsListComponent } from './reading-suggestions-list.component';
import { pickReadingSuggestions } from './pick-reading-suggestions';
import type { NavigationParams } from '@app-utils/navigation-params';
import { adaptStoryTeasersToReadingSuggestions } from './story-teaser-to-reading-suggestion.adapter';

/**
 * Sugerencias de otras obras de la misma colección. Es una de las dos variantes que monta
 * ReadingSuggestions: resuelve los datos y delega la presentación en ReadingSuggestionsList.
 *
 * TODO(#2036): cambiar el provider de Storylist a Collection cuando la página de lectura integre la tríada.
 *
 * Consume la colección completa y no la vista de navegación: es la que transporta el cuerpo recortado
 * del que sale el extracto. La de navegación proyecta `body: []` a propósito, porque la comparten la
 * landing y las navegaciones de autor y colección, que no lo necesitan.
 *
 * Muestra el autor de cada obra: una colección puede reunir obras de varios.
 */
@Component({
	selector: 'cuentoneta-collection-reading-suggestions',
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
			[showAuthor]="true"
		/>
	`,
})
export class CollectionReadingSuggestionsComponent {
	// Inputs
	public readonly collectionSlug = input.required<string>();
	public readonly currentWorkSlug = input<string>();

	private readonly appRoutes = AppRoutes;
	private readonly storylistService = inject(StorylistApi);

	// El sorteo ocurre acá, en el stream, y no en un computed: así se resuelve una sola vez por fetch
	// y las sugerencias no se rebarajan ante cualquier reevaluación.
	private readonly collectionResource = progressiveRxResource({
		// La obra en lectura entra en los params: al pasar a otra obra de la misma colección, el bloque
		// vuelve a resolverse en vez de seguir sugiriendo la que se está leyendo.
		params: () =>
			this.collectionSlug() ? { slug: this.collectionSlug(), currentWorkSlug: this.currentWorkSlug() } : undefined,
		stream: ({ params }) =>
			// Sin `amount`/`ordering`: el backend los descarta y devuelve la colección entera, así que
			// pasarlos sugeriría un recorte que no ocurre. El recorte a tres lo hace el picker.
			this.storylistService.get(params.slug).pipe(
				map((collection) => ({
					title: collection.title,
					suggestions: adaptStoryTeasersToReadingSuggestions(
						pickReadingSuggestions(collection.stories, params.currentWorkSlug),
					),
				})),
			),
		defaultValue: undefined,
	});

	// Si el fetch falla, el bloque se queda sin sugerencias y desaparece: es contenido accesorio al
	// pie de la lectura, no vale interrumpirla con un error. `hasValue()` evita que el recurso
	// relance la falla al leer el valor.
	private readonly collection = computed(() =>
		this.collectionResource.hasValue() ? this.collectionResource.value() : undefined,
	);
	private readonly title = computed(() => this.collection()?.title ?? '');

	protected readonly loading = computed(() => this.collectionResource.isLoading());
	protected readonly suggestions = computed(() => this.collection()?.suggestions ?? []);
	protected readonly heading = computed(() => `Más obras de ${this.title()}`);
	protected readonly moreLabel = computed(() => `Ver más de ${this.title()}`);
	protected readonly moreRoute = computed(() => ['/', this.appRoutes.StoryList, this.collectionSlug()]);
	protected readonly navigationParams = computed<NavigationParams>(() => ({
		navigation: 'storylist',
		navigationSlug: this.collectionSlug(),
	}));
}
