import { Component, computed, input } from '@angular/core';

/**
 * Apariencia del botón: fondo, borde y color de texto. No gobierna la geometría.
 * - `filled`: fondo blanco, sin borde
 * - `outline`: fondo neutral-50 con borde neutral-300
 * - `subtle`: fondo neutral-100, sin borde
 */
export type ButtonVariant = 'filled' | 'outline' | 'subtle';

/**
 * Geometría del botón: padding, tamaño de fuente y separación entre ícono y texto.
 * No gobierna la apariencia.
 * - `md`: la caja plena de una acción principal
 * - `sm`: caja compacta conservando el cuerpo de texto de `md`, para filas de opciones
 * - `xs`: la más compacta, con el texto también reducido
 */
export type ButtonSize = 'md' | 'sm' | 'xs';

/**
 * Componente Button
 *
 * Un componente basado en atributo que puede aplicarse tanto a elementos `<button>` como `<a>`.
 * Proporciona estilos consistentes basados en el sistema de diseño de Figma.
 *
 * Expone tres ejes independientes que se combinan libremente: `variant` (apariencia), `size`
 * (geometría) y `active` (estado). Coordinar qué opción está vigente dentro de un grupo, que la
 * elección sea excluyente y anunciarla con `aria-pressed` son responsabilidad del contenedor.
 *
 * @example
 * ```html
 * <!-- En un elemento button -->
 * <button cuentoneta-button variant="outline">Click me</button>
 *
 * <!-- En un elemento anchor con RouterLink -->
 * <a cuentoneta-button variant="outline" [routerLink]="'/collection'">Ver todo</a>
 *
 * <!-- Apariencia tenue en la geometría chica -->
 * <button cuentoneta-button variant="subtle" size="xs">
 *   <ng-icon name="shareIcon" />
 *   Compartir
 * </button>
 *
 * <!-- La opción vigente dentro de un grupo -->
 * <button cuentoneta-button variant="outline" [active]="true">Audio</button>
 * ```
 */
@Component({
	// eslint-disable-next-line @angular-eslint/component-selector -- Attribute selector usa el prefijo cuentoneta- pero restringido a tags <button> y <a>
	selector: 'button[cuentoneta-button], a[cuentoneta-button]',
	template: `<ng-content />`,
	host: {
		'[class]': 'hostClasses()',
	},
})
export class ButtonComponent {
	/** Apariencia del botón: fondo, borde y color de texto */
	public readonly variant = input<ButtonVariant>('filled');

	/** Geometría del botón: padding, tamaño de fuente y separación entre ícono y texto */
	public readonly size = input<ButtonSize>('md');

	/** Marca al botón como la opción vigente dentro de un grupo */
	public readonly active = input(false);

	// El ancho del borde se reserva acá, transparente, y cada apariencia solo le pone color: si lo
	// declarara `outline`, elegirla o marcarla vigente cambiaría la caja 2px y reflowearía la fila.
	private readonly baseClasses =
		'inline-flex cursor-pointer items-center justify-center font-inter font-semibold no-underline transition-colors duration-200 rounded-full border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50';

	private readonly variantClasses: Record<ButtonVariant, string> = {
		filled: 'bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
		outline: 'bg-neutral-50 text-neutral-900 border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200',
		subtle: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
	};

	private readonly sizeClasses: Record<ButtonSize, string> = {
		md: 'px-6 py-3 text-sm gap-2',
		sm: 'px-3 py-2 text-sm gap-1.5',
		xs: 'px-3 py-2 text-xs gap-1',
	};

	private readonly activeClasses = 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800 active:bg-neutral-700';

	/** Clases del host calculadas componiendo los tres ejes */
	protected readonly hostClasses = computed(() => {
		// El estado activo reemplaza la apariencia en vez de sumarse a ella: el contraste invertido
		// es el mismo para las tres, así que superponerlas dejaría fondos y bordes en conflicto.
		const appearance = this.active() ? this.activeClasses : this.variantClasses[this.variant()];

		return `${this.baseClasses} ${appearance} ${this.sizeClasses[this.size()]}`;
	});
}
