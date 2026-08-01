import { Component, computed, inject, input } from '@angular/core';

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

	private readonly collectionResource = progressiveRxResource({
		params: () => this.collectionSlug() || undefined,
		stream: ({ params: slug }) => this.storylistService.getStorylistNavigationTeasers(slug),
		defaultValue: undefined,
	});

	protected readonly loading = computed(() => this.collectionResource.isLoading());
	protected readonly heading = computed(() => `Más obras de ${this.collectionResource.value()?.title ?? ''}`);
	protected readonly moreLabel = computed(() => `Ver más de ${this.collectionResource.value()?.title ?? ''}`);
	protected readonly moreRoute = computed(() => ['/', this.appRoutes.StoryList, this.collectionSlug()]);
	protected readonly suggestions = computed(() =>
		pickReadingSuggestions(
			(this.collectionResource.value()?.stories ?? []).map(adaptStoryTeaserToLiteraryWorkTeaser),
			this.currentWorkSlug(),
		),
	);
}
