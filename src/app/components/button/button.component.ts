import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Variantes de tipo de botón basadas en el sistema de diseño de Figma
 * - `filled`: Fondo blanco, sin borde
 * - `outline`: Fondo blanco con borde neutral-300
 * - `share`: Fondo neutral-100, tamaño más pequeño para botones de compartir
 */
export type ButtonType = 'filled' | 'outline' | 'share';

/**
 * Componente Button
 *
 * Un componente basado en atributo que puede aplicarse tanto a elementos `<button>` como `<a>`.
 * Proporciona estilos consistentes basados en el sistema de diseño de Figma.
 *
 * @example
 * ```html
 * <!-- En un elemento button -->
 * <button cuentoneta-button type="outline">Click me</button>
 *
 * <!-- En un elemento anchor con RouterLink -->
 * <a cuentoneta-button type="outline" [routerLink]="'/storylist'">Ver todo</a>
 *
 * <!-- Variante de botón compartir -->
 * <button cuentoneta-button type="share">
 *   <ng-icon name="shareIcon" />
 *   Compartir
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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
	/** Variante del tipo de botón - determina el estilo visual */
	public readonly type = input<ButtonType>('filled');

	/** Clases del host calculadas según el tipo de botón */
	protected readonly hostClasses = computed(() => {
		const baseClasses =
			'inline-flex cursor-pointer items-center justify-center font-inter font-semibold no-underline transition-colors duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50';

		const typeClasses: Record<ButtonType, string> = {
			filled: 'bg-white text-neutral-900 px-6 py-3 text-sm hover:bg-neutral-50 active:bg-neutral-100',
			outline:
				'bg-white text-neutral-900 border border-1 border-neutral-300 px-6 py-3 text-sm hover:bg-neutral-50 active:bg-neutral-100',
			share: 'bg-neutral-100 text-neutral-900 px-3 py-2 text-xs gap-1 hover:bg-neutral-200 active:bg-neutral-300',
		};

		return `${baseClasses} ${typeClasses[this.type()]}`;
	});
}
