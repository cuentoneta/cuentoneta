import { computed, Directive, input } from '@angular/core';

import type { DrawerDirection } from './drawer.component';

/**
 * Calcula las clases de posición, tamaño y transform del panel del drawer según su dirección. Se aplica como
 * `hostDirective` de `DrawerComponent` con el input `direction` forwardeado. El par de transforms (offset base
 * + `data-[open]:...`) resuelve el slide en combinación con la transición declarada en el propio componente.
 */
@Directive({})
export class DrawerPanelDirective {
	public readonly direction = input<DrawerDirection>('right');

	private readonly panelConfig: Record<DrawerDirection, string> = {
		left: 'inset-y-0 left-0 h-full w-screen sm:w-[704px] -translate-x-full data-[open]:translate-x-0 drawer-left',
		right:
			'inset-y-0 right-0 ml-auto h-full w-screen sm:w-[704px] translate-x-full data-[open]:translate-x-0 drawer-right',
		top: 'inset-x-0 top-0 h-full w-screen sm:max-h-3/4 -translate-y-full data-[open]:translate-y-0 drawer-top',
		bottom:
			'inset-x-0 bottom-0 mt-auto h-full w-screen sm:max-h-3/4 translate-y-full data-[open]:translate-y-0 drawer-bottom',
	};

	public readonly panelClasses = computed(() => this.panelConfig[this.direction()]);
}
