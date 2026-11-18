import { Component, computed, input } from '@angular/core';

/**
 * Variantes visuales del tag (Design System v3):
 * - `soft` (default): solo texto en `brand-500`, sin fondo.
 * - `filled`: pill `brand-50` con texto `brand-500` en mayúsculas.
 * - `gray`: pill translúcido oscuro (`neutral-950-40`) con texto claro (`neutral-50`), pensado para
 *   mostrarse sobre imágenes.
 */
export type TagVariant = 'soft' | 'filled' | 'gray';

/**
 * Etiqueta (tag) del Design System v3. Componente de presentación que muestra el texto del label
 * tal como está cargado, con el estilo correspondiente a la variante indicada.
 */
@Component({
	selector: 'cuentoneta-tag',
	template: `{{ label() }}`,
	host: {
		'[class]': 'hostClasses()',
	},
})
export class Tag {
	// Inputs
	public readonly label = input.required<string>();
	public readonly variant = input<TagVariant>('soft');

	// Clases (chrome + tipografía) por variante. Las dimensiones/colores salen de tokens del DS v3.
	private readonly variantClasses: Record<TagVariant, string> = {
		soft: 'text-xs text-brand-500',
		filled: 'rounded-sm bg-brand-50 px-2 py-1 text-xxs text-brand-500 uppercase',
		gray: 'rounded-sm bg-neutral-950-40 px-1.5 py-1 text-xxs text-neutral-50',
	};

	private readonly hostClasses = computed(
		() => `inline-flex items-center font-inter font-bold whitespace-nowrap ${this.variantClasses[this.variant()]}`,
	);
}
