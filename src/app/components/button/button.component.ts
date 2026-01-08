import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Button type variants based on Figma design system
 * - `filled`: White background, no border
 * - `outline`: White background with neutral-300 border
 * - `share`: Neutral-100 background, smaller size for share buttons
 */
export type ButtonType = 'filled' | 'outline' | 'share';

/**
 * Button Component
 *
 * An attribute-based component that can be applied to both `<button>` and `<a>` elements.
 * Provides consistent styling based on the Figma design system.
 *
 * @example
 * ```html
 * <!-- On a button element -->
 * <button cuentonetaButton type="outline">Click me</button>
 *
 * <!-- On an anchor element with RouterLink -->
 * <a cuentonetaButton type="outline" [routerLink]="'/storylist'">Ver todo</a>
 *
 * <!-- Share button variant -->
 * <button cuentonetaButton type="share">
 *   <ng-icon name="shareIcon" />
 *   Compartir
 * </button>
 * ```
 */
@Component({
	selector: '[cuentonetaButton]',
	standalone: true,
	template: `<ng-content />`,
	host: {
		'[class]': 'hostClasses()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
	/** Button type variant - determines the visual style */
	readonly type = input<ButtonType>('filled');

	/** Computed host classes based on button type */
	readonly hostClasses = computed(() => {
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
