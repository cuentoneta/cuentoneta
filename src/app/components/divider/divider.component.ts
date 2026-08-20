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
 * Por defecto se anuncia como separador. Dentro de un marcado que ya delimita sus partes —una lista,
 * una tabla— conviene marcarla `decorative` para no duplicar esa información.
 *
 * @example
 * ```html
 * <!-- Entre dos bloques apilados -->
 * <cuentoneta-divider />
 *
 * <!-- Entre ítems de una lista, que ya los delimita por sí sola -->
 * <cuentoneta-divider [decorative]="true" />
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
		'[attr.role]': 'role()',
		'[attr.aria-orientation]': 'ariaOrientation()',
		'[class]': 'hostClasses()',
	},
})
export class DividerComponent {
	/** Eje sobre el que se dibuja la línea */
	public readonly orientation = input<DividerOrientation>('horizontal');

	/**
	 * Marca la línea como puramente visual, sin rol de separador.
	 *
	 * Se usa cuando el marcado que la rodea ya comunica la separación —los ítems de una lista, las
	 * filas de una tabla— y la línea solo la dibuja: ahí el rol duplica lo que la estructura ya dice y
	 * un lector de pantalla lo anuncia dos veces.
	 */
	public readonly decorative = input(false);

	protected readonly role = computed(() => (this.decorative() ? 'presentation' : 'separator'));

	// Un `aria-orientation` sobre un elemento presentacional no significa nada, así que se omite en
	// lugar de emitirlo huérfano.
	protected readonly ariaOrientation = computed(() => (this.decorative() ? null : this.orientation()));

	// `block` porque un elemento custom es inline por defecto y una línea inline no toma ancho;
	// `shrink-0` para que el único píxel no se comprima a cero dentro de un contenedor apretado.
	private readonly baseClasses = 'block shrink-0 bg-neutral-200';

	private readonly orientationClasses: Record<DividerOrientation, string> = {
		horizontal: 'h-px w-full',
		vertical: 'w-px self-stretch',
	};

	protected readonly hostClasses = computed(() => `${this.baseClasses} ${this.orientationClasses[this.orientation()]}`);
}
