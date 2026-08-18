import { Component, computed, input } from '@angular/core';

/**
 * Apariencia del botón: fondo, borde y color de texto. No dice nada de su tamaño.
 * - `filled`: Fondo blanco, sin borde
 * - `outline`: Fondo blanco con borde neutral-300
 * - `share`: Fondo neutral-100, sin borde
 */
export type ButtonType = 'filled' | 'outline' | 'share';

/**
 * Geometría del botón: padding, tamaño de fuente y separación entre ícono y texto. No dice nada de
 * su apariencia.
 * - `md`: Tamaño de las acciones de página
 * - `sm`: Compacto, para botones que se alinean en una fila de opciones
 * - `xs`: El más chico, para acciones accesorias como compartir en redes
 */
export type ButtonSize = 'md' | 'sm' | 'xs';

/**
 * Componente Button
 *
 * Un componente basado en atributo que puede aplicarse tanto a elementos `<button>` como `<a>`.
 * Proporciona estilos consistentes basados en el sistema de diseño de Figma.
 *
 * Los tres inputs son ejes independientes: `type` elige la apariencia, `size` la geometría y `active`
 * marca al botón como la opción vigente de un grupo. Mantenerlos separados es lo que evita que el
 * catálogo de variantes crezca con una entrada por cada pantalla que combine distinto —el mismo motivo
 * por el que el Figma ya modela tipo y tamaño como props aparte.
 *
 * @example
 * ```html
 * <!-- En un elemento button -->
 * <button cuentoneta-button type="outline">Click me</button>
 *
 * <!-- En un elemento anchor con RouterLink -->
 * <a cuentoneta-button type="outline" [routerLink]="'/storylist'">Ver todo</a>
 *
 * <!-- Botón compartir: apariencia gris en el tamaño más chico -->
 * <button cuentoneta-button type="share" size="xs">
 *   <ng-icon name="shareIcon" />
 *   Compartir
 * </button>
 *
 * <!-- Una opción dentro de un grupo, marcada como la elegida -->
 * <button cuentoneta-button type="outline" size="sm" [active]="true">
 *   <ng-icon name="simpleSpotify" />
 *   Spotify
 * </button>
 * ```
 */
@Component({
	// eslint-disable-next-line @angular-eslint/component-selector -- Attribute selector usa el prefijo cuentoneta- pero restringido a tags <button> y <a>
	selector: 'button[cuentoneta-button], a[cuentoneta-button]',
	standalone: true,
	template: `<ng-content />`,
	host: {
		'[class]': 'hostClasses()',
	},
})
export class ButtonComponent {
	/** Apariencia del botón */
	public readonly type = input<ButtonType>('filled');

	/** Geometría del botón */
	public readonly size = input<ButtonSize>('md');

	/** Marca el botón como la opción vigente dentro de un grupo de opciones */
	public readonly active = input(false);

	/** Clases del host, compuestas a partir de los tres ejes */
	protected readonly hostClasses = computed(() => {
		const baseClasses =
			'inline-flex cursor-pointer items-center justify-center font-inter font-semibold no-underline transition-colors duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50';

		const typeClasses: Record<ButtonType, string> = {
			filled: 'bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
			outline: 'bg-white text-neutral-900 border border-1 border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',
			share: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
		};

		const sizeClasses: Record<ButtonSize, string> = {
			md: 'px-6 py-3 text-sm',
			sm: 'px-3 py-2 text-sm gap-1.5',
			xs: 'px-3 py-2 text-xs gap-1',
		};

		// La opción elegida invierte el contraste y deja de dibujar el borde. Reemplaza a la apariencia en vez
		// de sumarse a ella, y por eso vale igual para las tres: el estado es del botón, no de una apariencia
		// en particular.
		const activeClasses = 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800 active:bg-neutral-700';

		const appearance = this.active() ? activeClasses : typeClasses[this.type()];

		return `${baseClasses} ${appearance} ${sizeClasses[this.size()]}`;
	});
}
