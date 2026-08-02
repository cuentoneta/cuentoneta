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
	// Requerido aunque la variante de colección no lo use: la de autor es la rama por defecto, así que
	// cualquier consumidor puede terminar en ella y sin el nombre el encabezado quedaría a medias.
	public readonly authorName = input.required<string>();
	public readonly currentWorkSlug = input<string>();

	// Reserva el alto del bloque para que su aparición no empuje el pie de página. El valor sale de su
	// composición: tres portadas de `h-41` (164px) más la separación entre tarjetas, el encabezado, el
	// acceso al listado y el relleno del contenedor.
	protected readonly placeholderClasses = 'h-189';
}
