import { afterNextRender, Directive, effect, ElementRef, inject, signal } from '@angular/core';

// El redondeo sub-pixel del alto de línea hace que un texto que entra justo mida un píxel de más.
const OVERFLOW_TOLERANCE_PX = 1;

/**
 * Informa si el contenido de su host desborda el recorte por líneas (`line-clamp-*`) que tenga aplicado,
 * comparando el alto del contenido contra el visible. Existe para decidir si ofrecer un "Leer más": sin la
 * medición habría que mostrarlo siempre, también cuando el texto entra completo.
 *
 * Observa el host con `ResizeObserver` porque el recorte depende del ancho disponible, y en zoneless un
 * resize de ventana no dispara detección de cambios por sí solo. Sin layout (SSR, entorno de tests) el
 * observer no se crea y el host se reporta como no desbordado, que es el estado seguro: se omite el
 * "Leer más" en vez de ofrecerlo sobre un texto entero.
 */
@Directive({
	selector: '[cuentonetaClampOverflow]',
	exportAs: 'cuentonetaClampOverflow',
})
export class ClampOverflowDirective {
	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

	private readonly overflowing = signal(false);
	public readonly isOverflowing = this.overflowing.asReadonly();

	// El observer recién se crea tras el primer render (browser-only).
	private readonly ready = signal(false);
	private readonly markReady = afterNextRender(() => this.ready.set(true));

	private readonly observerEffect = effect((onCleanup) => {
		if (!this.ready()) {
			return;
		}
		const element = this.host.nativeElement;
		const observer = new ResizeObserver(() =>
			this.overflowing.set(element.scrollHeight > element.clientHeight + OVERFLOW_TOLERANCE_PX),
		);
		observer.observe(element);
		onCleanup(() => observer.disconnect());
	});
}
