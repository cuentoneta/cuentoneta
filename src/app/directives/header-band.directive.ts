import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

import { LayoutService } from '../providers/layout.interface';

/**
 * Declara que su host es una banda que la barra fija cubre: mientras quede alguna parte del host en
 * pantalla, la barra suelta su fondo, y lo recupera apenas la banda sale de cuadro.
 *
 * El host tiene que empezar en el borde superior de la ventana —lo que la página marca con
 * `bleeds-under-header`—: es lo que vuelve equivalentes "sigue en pantalla" y "cubre la barra".
 */
@Directive({})
export class HeaderBand {
	private readonly layout = inject(LayoutService);
	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly destroyRef = inject(DestroyRef);

	constructor() {
		// La declaración no espera al observer: en el servidor no hay geometría y el HTML sale ya sin
		// el fondo. Al destruirse la banda, la página siguiente no hereda la barra sin fondo.
		this.layout.setHeaderOverBand(true);
		this.destroyRef.onDestroy(() => this.layout.setHeaderOverBand(false));

		afterNextRender(() => {
			const observer = new IntersectionObserver((entries) => {
				this.layout.setHeaderOverBand(entries.some((entry) => entry.isIntersecting));
			});
			observer.observe(this.host.nativeElement);
			this.destroyRef.onDestroy(() => observer.disconnect());
		});
	}
}
