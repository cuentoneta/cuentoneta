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
			@case ('collection') {
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

	// Reserva el alto del bloque para que su aparición no empuje el pie de página.
	//
	// El valor está medido sobre el bloque ya montado en la página de lectura, no derivado de su
	// composición: el revestimiento cambia varias separaciones a la vez y la aritmética se desactualiza
	// en silencio. Se midió con la cantidad completa de sugerencias, que es la que las dos variantes
	// pintan cuando hay datos: reservar por variante no corresponde, porque lo que mueve el alto es
	// cuántas obras entran y no cuál de las dos ramas las trajo.
	//
	// Es un alto fijo, así que solo acierta al ancho en que se midió: en pantallas angostas, donde los
	// títulos y los extractos ocupan más líneas, el bloque va a superarlo y el pie se va a correr un
	// poco. Reservar de más en el caso ancho sería peor, porque deja un hueco visible en el caso común.
	protected readonly placeholderClasses = 'h-211';
}
