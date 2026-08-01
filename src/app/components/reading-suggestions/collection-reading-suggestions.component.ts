import { Component, computed, inject, input } from '@angular/core';
import { map } from 'rxjs';

import { AppRoutes } from '../../app.routes';
import { StorylistApi } from '../../providers/storylist-api.interface';
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import { pickReadingSuggestions } from './pick-reading-suggestions';
import { adaptStoryTeaserToLiteraryWorkTeaser } from './story-teaser-to-literary-work.adapter';

/**
 * Sugerencias de otras obras de la misma colección. Resuelve los datos y delega la presentación en
 * ReadingSuggestions.
 *
 * TODO: cambiar el provider de Storylist a Collection cuando la página de lectura integre la tríada.
 *
 * Muestra el autor de cada obra: una colección puede reunir obras de varios.
 */
@Component({
	selector: 'cuentoneta-collection-reading-suggestions',
	imports: [ReadingSuggestionsComponent],
	host: { class: 'block' },
	template: `
		<cuentoneta-reading-suggestions
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
			this.storylistService.getStorylistNavigationTeasers(params.slug).pipe(
				map((collection) => ({
					title: collection.title,
					suggestions: pickReadingSuggestions(
						collection.stories.map(adaptStoryTeaserToLiteraryWorkTeaser),
						params.currentWorkSlug,
					),
				})),
			),
		defaultValue: undefined,
	});

	private readonly title = computed(() => this.collectionResource.value()?.title ?? '');

	protected readonly loading = computed(() => this.collectionResource.isLoading());
	protected readonly suggestions = computed(() => this.collectionResource.value()?.suggestions ?? []);
	protected readonly heading = computed(() => `Más obras de ${this.title()}`);
	protected readonly moreLabel = computed(() => `Ver más de ${this.title()}`);
	protected readonly moreRoute = computed(() => ['/', this.appRoutes.StoryList, this.collectionSlug()]);
	protected readonly navigationParams = computed(() => ({
		navigation: 'storylist',
		navigationSlug: this.collectionSlug(),
	}));
}
