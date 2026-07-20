import { computed, Directive, input } from '@angular/core';

import type { DrawerDirection } from './drawer.component';

/**
 * Calcula las clases de posición, tamaño y transform del panel del drawer según su dirección. Se aplica como
 * `hostDirective` de `DrawerComponent` con el input `direction` forwardeado. El par de transforms (offset base
 * + `data-[open]:...`) resuelve el slide en combinación con la transición declarada en el propio componente.
 *
 * El panel flota con un gap de `spacing/4` (16px) respecto de los bordes del viewport —igual que el contenedor
 * del Drawer en Figma—: el borde anclado más los dos perpendiculares. El offset de salida es `120%` (relativo al
 * propio tamaño), que oculta el panel por completo pese al margen. Los `*-auto` resetean el `inset: 0` que el
 * user-agent aplica a `dialog:modal` en el borde opuesto al anclado (si no, ese borde quedaría pegado en `0`).
 */
@Directive({})
export class DrawerPanelDirective {
	public readonly direction = input<DrawerDirection>('right');

	private readonly panelConfig: Record<DrawerDirection, string> = {
		left: 'left-4 right-auto top-4 h-[calc(100vh_-_2rem)] max-h-none w-[calc(100vw_-_2rem)] sm:w-[704px] -translate-x-[120%] data-[open]:translate-x-0 drawer-left',
		right:
			'right-4 left-auto top-4 h-[calc(100vh_-_2rem)] max-h-none w-[calc(100vw_-_2rem)] sm:w-[704px] translate-x-[120%] data-[open]:translate-x-0 drawer-right',
		top: 'left-4 top-4 bottom-auto w-[calc(100vw_-_2rem)] max-h-[calc(100vh_-_2rem)] -translate-y-[120%] data-[open]:translate-y-0 drawer-top',
		bottom:
			'bottom-4 top-auto left-4 w-[calc(100vw_-_2rem)] max-h-[calc(100vh_-_2rem)] translate-y-[120%] data-[open]:translate-y-0 drawer-bottom',
	};

	public readonly panelClasses = computed(() => this.panelConfig[this.direction()]);
}
