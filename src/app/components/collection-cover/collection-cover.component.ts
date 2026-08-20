import { Component, input } from '@angular/core';

import type { CollectionImagery } from '@models/collection.model';
import { CoverImageComponent } from '../cover-image/cover-image.component';

/**
 * Portada de una colección del Design System v3. Es a `imagery` lo que CoverImage es a la portada de
 * una obra: resuelve las dos formas que declara el dominio y produce una caja de alto constante.
 *
 * - `representative`: la imagen editorial de la colección, en la caja de una portada (118×164).
 * - `sample`: el abanico de tres portadas de obras que contiene, sobre una caja de 270×164 — la del
 *   frente es la primera, elevada respecto de las laterales, que se apoyan más abajo y sangran por el
 *   borde inferior.
 *
 * Las dos formas miden lo mismo de alto, que es lo que permite intercambiarlas —y sustituirlas por un
 * esqueleto— sin mover lo que sigue en la columna.
 *
 * El marco es del consumidor: el componente no aporta fondo, radio exterior ni recorte. La tarjeta de
 * colección lo monta dentro de su caja gris; el panel de información, pelado.
 */
@Component({
	selector: 'cuentoneta-collection-cover',
	imports: [CoverImageComponent],
	host: { class: 'block w-fit shrink-0' },
	template: `
		@if (imagery(); as imagery) {
			@if (imagery.kind === 'representative') {
				<cuentoneta-cover-image [src]="imagery.image" [priority]="priority()" />
			} @else {
				<div class="relative isolate h-41 w-67.5 overflow-hidden" data-testid="cover-fan">
					@for (image of imagery.images; track $index) {
						<cuentoneta-cover-image
							[src]="image"
							[priority]="priority() && $first"
							[class]="sampleImageClasses[$index]"
							data-testid="fan-slot"
						/>
					}
				</div>
			}
		}
	`,
})
export class CollectionCoverComponent {
	public readonly imagery = input.required<CollectionImagery>();

	/** Marca la portada del frente como prioritaria; las laterales nunca compiten por ser el LCP. */
	public readonly priority = input(false);

	// Las tres posiciones del abanico, leídas del diseño contra el borde que cada portada usa: la del
	// frente arriba y centrada, las laterales más abajo y pegadas a los costados.
	protected readonly sampleImageClasses = [
		'absolute top-2.5 left-1/2 z-raised -translate-x-1/2 border-[3px] border-neutral-100',
		'absolute top-7 left-1.25 z-content border-[3px] border-neutral-100',
		'absolute top-7 right-1.25 z-content border-[3px] border-neutral-100',
	] as const;
}
