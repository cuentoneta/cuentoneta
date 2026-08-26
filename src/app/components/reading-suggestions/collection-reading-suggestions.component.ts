import { Component, computed, inject, input } from '@angular/core';
import { map } from 'rxjs';

import { AppRoutes } from '../../app.routes';
import { CollectionApi } from '../../providers/collection.provider';
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { ReadingSuggestionsListComponent } from './reading-suggestions-list.component';
import { pickReadingSuggestions } from './pick-reading-suggestions';
import type { NavigationParams } from '@app-utils/navigation-params';

/**
 * Sugerencias de otras obras de la misma colección. Es una de las dos variantes que monta
 * ReadingSuggestions: resuelve los datos y delega la presentación en ReadingSuggestionsList.
 *
 * Consume el agregado completo y no su vista de navegación: es el que transporta las obras con su
 * extracto, que es lo que la tarjeta pinta bajo el título.
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
	private readonly collectionService = inject(CollectionApi);

	// El sorteo ocurre acá, en el stream, y no en un computed: así se resuelve una sola vez por fetch
	// y las sugerencias no se rebarajan ante cualquier reevaluación.
	private readonly collectionResource = progressiveRxResource({
		// La obra en lectura entra en los params: al pasar a otra obra de la misma colección, el bloque
		// vuelve a resolverse en vez de seguir sugiriendo la que se está leyendo.
		params: () =>
			this.collectionSlug() ? { slug: this.collectionSlug(), currentWorkSlug: this.currentWorkSlug() } : undefined,
		stream: ({ params }) =>
			this.collectionService.getBySlug(params.slug).pipe(
				map((collection) => ({
					title: collection.title,
					suggestions: pickReadingSuggestions(collection.literaryWorks, params.currentWorkSlug),
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
	protected readonly moreRoute = computed(() => ['/', this.appRoutes.Collection, this.collectionSlug()]);
	protected readonly navigationParams = computed<NavigationParams>(() => ({
		navigation: 'collection',
		navigationSlug: this.collectionSlug(),
	}));
}
