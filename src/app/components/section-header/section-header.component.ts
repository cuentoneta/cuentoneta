import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@components/button/button.component';

/**
 * Encabezado de sección del Design System v3: título, bajada opcional y acción opcional hacia el
 * índice completo de la sección. Es la pieza única que usan las secciones de la página de inicio.
 *
 * El texto visible de la acción es fijo porque el diseño lo repite idéntico en todas las secciones;
 * el que varía es el nombre accesible, ya que cuatro enlaces llamados «Ver todo» no distinguen
 * destinos para quien navega por la lista de enlaces.
 */
@Component({
	selector: 'cuentoneta-section-header',
	imports: [RouterLink, ButtonComponent],
	template: `
		<div class="flex flex-col content-between gap-1">
			<h2 class="font-inter text-2xl font-bold">{{ heading() }}</h2>
			@if (subtitle()) {
				<div class="font-inter text-sm text-neutral-600">{{ subtitle() }}</div>
			}
		</div>

		@if (actionLink().length > 0) {
			<a
				[routerLink]="actionLink()"
				[attr.aria-label]="actionAriaLabel()"
				cuentoneta-button
				variant="outline"
				size="sm"
				class="shrink-0"
			>
				Ver todo
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
	public readonly actionLink = input<readonly string[]>([]);
	public readonly actionAriaLabel = input<string>('');
}
