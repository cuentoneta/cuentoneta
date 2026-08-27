import { Component, input } from '@angular/core';

/**
 * Aviso de que una sección no tiene nada que mostrar, según el Design System v3.
 *
 * Ocupa el lugar de la grilla para que la sección no quede en blanco debajo de su encabezado: sin él,
 * un listado vacío se lee como contenido que no terminó de cargar.
 */
@Component({
	selector: 'cuentoneta-empty-state',
	template: `<p class="font-inter text-base text-neutral-600">{{ message() }}</p>`,
	host: {
		class: 'flex min-h-24 items-center justify-center rounded-lg bg-neutral-100 px-6 py-8 text-center',
		'data-testid': 'empty-state',
	},
})
export class EmptyStateComponent {
	public readonly message = input.required<string>();
}
