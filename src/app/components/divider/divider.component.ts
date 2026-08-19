import { Component, computed, input } from '@angular/core';

/**
 * Eje sobre el que se dibuja la línea divisoria:
 * - `horizontal` (default): 1px de alto, ocupa el ancho del contenedor. Separa elementos apilados.
 * - `vertical`: 1px de ancho, toma el alto disponible. Separa elementos dispuestos en fila.
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Línea divisoria del Design System v3. Componente de presentación cuyo elemento anfitrión *es* la
 * línea: no proyecta contenido ni acepta interacción.
 *
 * La variante `vertical` se estira con `self-stretch`, así que necesita un contenedor flex o grid
 * con alto resuelto; dentro de un contenedor block queda con alto cero y no se ve.
 *
 * @example
 * ```html
 * <!-- Entre dos bloques apilados -->
 * <cuentoneta-divider />
 *
 * <!-- Entre dos columnas de una fila -->
 * <div class="flex items-stretch gap-4">
 *   <p>Izquierda</p>
 *   <cuentoneta-divider orientation="vertical" />
 *   <p>Derecha</p>
 * </div>
 * ```
 */
@Component({
	selector: 'cuentoneta-divider',
	template: '',
	host: {
		role: 'separator',
		'[attr.aria-orientation]': 'orientation()',
		'[class]': 'hostClasses()',
	},
})
export class DividerComponent {
	/** Eje sobre el que se dibuja la línea */
	public readonly orientation = input<DividerOrientation>('horizontal');

	// `block` porque un elemento custom es inline por defecto y una línea inline no toma ancho;
	// `shrink-0` para que el único píxel no se comprima a cero dentro de un contenedor apretado.
	private readonly baseClasses = 'block shrink-0 bg-neutral-200';

	private readonly orientationClasses: Record<DividerOrientation, string> = {
		horizontal: 'h-px w-full',
		vertical: 'w-px self-stretch',
	};

	protected readonly hostClasses = computed(() => `${this.baseClasses} ${this.orientationClasses[this.orientation()]}`);
}
