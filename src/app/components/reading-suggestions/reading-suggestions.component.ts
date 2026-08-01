import { Component, input } from '@angular/core';

import { AuthorReadingSuggestionsComponent } from './author-reading-suggestions.component';
import { CollectionReadingSuggestionsComponent } from './collection-reading-suggestions.component';
import type { NavigationParams } from '@app-utils/navigation-params';

/**
 * Sugerencias de lectura al pie de una obra. Único punto de entrada del bloque: quien lo consume no
 * conoce las variantes ni el contexto de navegación que las elige, solo lo transporta.
 *
 * Cada variante vive en su propio `@defer`, así se descarga el bundle de la que se va a usar y no el
 * de la otra. El diferido también mantiene el bloque fuera del servidor: en SSR se sirve el
 * marcador de posición, sin instanciar la variante ni pedir datos.
 */
@Component({
	selector: 'cuentoneta-reading-suggestions',
	imports: [AuthorReadingSuggestionsComponent, CollectionReadingSuggestionsComponent],
	host: { class: 'block' },
	template: `
		@switch (navigationParams().navigation) {
			@case ('storylist') {
				@defer (on viewport) {
					<cuentoneta-collection-reading-suggestions
						[collectionSlug]="navigationParams().navigationSlug"
						[currentWorkSlug]="currentWorkSlug()"
					/>
				} @placeholder {
					<div [class]="placeholderClasses"></div>
				}
			}
			@default {
				@defer (on viewport) {
					<cuentoneta-author-reading-suggestions
						[authorSlug]="navigationParams().navigationSlug"
						[authorName]="authorName()"
						[currentWorkSlug]="currentWorkSlug()"
					/>
				} @placeholder {
					<div [class]="placeholderClasses"></div>
				}
			}
		}
	`,
})
export class ReadingSuggestionsComponent {
	// Inputs
	public readonly navigationParams = input.required<NavigationParams>();
	public readonly authorName = input<string>('');
	public readonly currentWorkSlug = input<string>();

	// Reserva el alto del bloque para que la aparición de las sugerencias no empuje el pie de página.
	protected readonly placeholderClasses = 'h-96';
}
