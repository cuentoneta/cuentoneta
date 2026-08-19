import { afterNextRender, Directive, effect, ElementRef, inject, signal } from '@angular/core';

/**
 * Informa si el contenido de su host desborda el recorte por líneas (`line-clamp-*`) que tenga aplicado,
 * comparando el alto del contenido contra el visible. Existe para decidir si ofrecer un "Leer más": sin la
 * medición habría que mostrarlo siempre, también cuando el texto entra completo.
 *
 * Observa el host con `ResizeObserver` porque el recorte depende del ancho disponible, y en zoneless un
 * resize de ventana no dispara detección de cambios por sí solo. Con `line-clamp-N` la caja mide
 * `min(contenido, N líneas)`, así que todo cambio de contenido que cruce ese umbral también la cambia y
 * vuelve a medir; el caso que el observer no ve es la fuente que carga tarde con un `leading` explícito,
 * donde la caja no cambia y solo crece el contenido, y por eso se re-mide al resolverse `document.fonts`.
 *
 * Sin layout (SSR) el observer no se crea y el host se reporta como no desbordado, que es el estado
 * seguro: se omite el "Leer más" en vez de ofrecerlo sobre un texto entero, y al hidratar el control
 * aparece en vez de desaparecer bajo el cursor.
 *
 * **Precondición:** el host tiene que estar recortado por líneas, no por un alto fijo — con un alto fijo
 * la medición informa cualquier desborde, no el del recorte. El control que se ofrezca debe vivir **fuera**
 * del elemento observado: adentro cambiaría lo que se mide.
 */
@Directive({
	selector: '[cuentonetaClampOverflow]',
	exportAs: 'cuentonetaClampOverflow',
})
export class ClampOverflowDirective {
	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

	private readonly overflowing = signal(false);
	public readonly isOverflowing = this.overflowing.asReadonly();

	// El redondeo sub-pixel del alto de línea hace que un texto que entra justo mida un píxel de más.
	private readonly overflowTolerancePx = 1;

	// El observer recién se crea tras el primer render, que solo ocurre en el navegador.
	private readonly ready = signal(false);
	private readonly markReadyAfterFirstRender = afterNextRender(() => this.ready.set(true));

	private readonly observeHostEffect = effect((onCleanup) => {
		if (!this.ready()) {
			return;
		}

		const observer = new ResizeObserver(() => this.measure());
		observer.observe(this.host.nativeElement);

		let cancelled = false;
		document.fonts.ready.then(() => {
			if (!cancelled) {
				this.measure();
			}
		});

		onCleanup(() => {
			cancelled = true;
			observer.disconnect();
		});
	});

	private measure(): void {
		const element = this.host.nativeElement;
		this.overflowing.set(element.scrollHeight > element.clientHeight + this.overflowTolerancePx);
	}
}
