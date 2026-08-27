import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@components/button/button.component';

/**
 * Acción de un encabezado de sección: a dónde lleva, y qué la distingue de las demás.
 *
 * Van juntos porque el nombre accesible solo tiene sentido con un destino, y un destino sin nombre
 * deja cuatro enlaces llamados igual: separarlos en dos inputs opcionales permitía tener uno sin el otro.
 */
export type SectionHeaderAction = {
	readonly link: readonly string[];
	/** Continúa el «Ver todo» visible hasta nombrar el destino: «el catálogo de obras». */
	readonly accessibleSuffix: string;
};

/**
 * Encabezado de sección del Design System v3: título, bajada opcional y acción opcional hacia el
 * índice completo de la sección. Es la pieza única que usan las secciones de la página de inicio.
 *
 * El sufijo del nombre accesible se agrega al texto visible en vez de reemplazarlo con `aria-label`:
 * WCAG 2.5.3 exige que el nombre accesible contenga el texto visible, y quien usa control por voz dice
 * lo que ve.
 */
@Component({
	selector: 'cuentoneta-section-header',
	imports: [RouterLink, ButtonComponent],
	template: `
		<div class="flex flex-col content-between gap-1">
			<h2 class="font-inter text-2xl font-bold">{{ heading() }}</h2>
			@if (subtitle()) {
				<p class="font-inter text-sm text-neutral-600">{{ subtitle() }}</p>
			}
		</div>

		@if (action(); as action) {
			<a [routerLink]="action.link" cuentoneta-button variant="outline" size="sm" class="shrink-0">
				Ver todo <span class="sr-only">{{ action.accessibleSuffix }}</span>
			</a>
		}
	`,
	host: {
		class: 'flex items-center justify-between gap-4',
	},
})
export class SectionHeaderComponent {
	public readonly heading = input.required<string>();
	public readonly subtitle = input<string>('');
	public readonly action = input<SectionHeaderAction | undefined>(undefined);
}
