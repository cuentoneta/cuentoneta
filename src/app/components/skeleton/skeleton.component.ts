import { Component, input } from '@angular/core';

export const SkeletonAppearance = Object.freeze({
	Line: 'line',
	Circle: 'circle',
	Square: 'square',
} as const);
export type SkeletonAppearance = (typeof SkeletonAppearance)[keyof typeof SkeletonAppearance];

/**
 * Barra de carga (skeleton) reutilizable. El host ES la barra: el consumidor controla alto, ancho y
 * color con clases utilitarias de Tailwind directamente sobre el elemento
 * (`<cuentoneta-skeleton class="h-[36px] w-[40px] bg-brand-300" />`). El input `appearance` define la
 * forma: `line` agrega un radio chico, `circle` fuerza un avatar redondo y `square` deja el radio en
 * manos del consumidor (no impone ninguno) para evitar colisiones de cascada con su clase `rounded-*`.
 * Para varias barras, el consumidor repite el elemento con `@for`.
 */
@Component({
	selector: 'cuentoneta-skeleton',
	template: '',
	host: {
		role: 'status',
		'aria-busy': 'true',
		'aria-label': 'Cargando',
		class: 'block animate-pulse',
		'[class.rounded]': "appearance() === 'line'",
		'[class.rounded-full]': "appearance() === 'circle'",
		'[class.aspect-square]': "appearance() === 'circle'",
	},
})
export class SkeletonComponent {
	public readonly appearance = input<SkeletonAppearance>(SkeletonAppearance.Line);
}
