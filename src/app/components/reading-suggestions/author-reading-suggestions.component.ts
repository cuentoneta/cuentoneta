import { Component, computed, inject, input } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { StoryApi } from '../../providers/story-api.interface';
import { progressiveRxResource } from '@app-utils/ssr-resource';
import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import { pickReadingSuggestions } from './pick-reading-suggestions';
import { adaptStoryTeaserToLiteraryWorkTeaser } from './story-teaser-to-literary-work.adapter';

/**
 * Sugerencias de otras obras del mismo autor. Resuelve los datos y delega la presentación en
 * ReadingSuggestions.
 *
 * TODO: cambiar el provider de Story a LiteraryWork cuando la página de lectura integre la tríada.
 *
 * El recurso es deliberadamente progresivo (no bloquea el SSR): quien lo consume monta el bloque
 * dentro de un `@defer (on viewport)`, así el fetch ocurre una sola vez y ya en el cliente.
 */
@Component({
	selector: 'cuentoneta-author-reading-suggestions',
	imports: [ReadingSuggestionsComponent],
	host: { class: 'block' },
	template: `
		<cuentoneta-reading-suggestions
			[heading]="heading()"
			[teasers]="suggestions()"
			[loading]="loading()"
			[moreLabel]="moreLabel()"
			[moreRoute]="moreRoute()"
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

	private readonly storiesResource = progressiveRxResource({
		params: () => this.authorSlug() || undefined,
		stream: ({ params: slug }) => this.storyService.getNavigationTeasersByAuthorSlug(slug),
		defaultValue: [],
	});

	protected readonly loading = computed(() => this.storiesResource.isLoading());
	protected readonly heading = computed(() => `Más obras de ${this.authorName()}`);
	protected readonly moreLabel = computed(() => `Ver más de ${this.authorName()}`);
	protected readonly moreRoute = computed(() => ['/', this.appRoutes.Author, this.authorSlug()]);
	protected readonly suggestions = computed(() =>
		pickReadingSuggestions(
			this.storiesResource.value().map(adaptStoryTeaserToLiteraryWorkTeaser),
			this.currentWorkSlug(),
		),
	);
}
