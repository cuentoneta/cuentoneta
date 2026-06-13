import {
	afterNextRender,
	computed,
	contentChildren,
	DestroyRef,
	Directive,
	effect,
	ElementRef,
	inject,
	input,
	Renderer2,
	signal,
} from '@angular/core';

import { TagComponent } from '../tag/tag.component';

/** Espacio (px) reservado a la derecha para el contador "+N" al decidir qué ítems entran. */
const COUNTER_RESERVE_PX = 44;

/** Separación entre ítems (px); debe coincidir con el `gap` de la fila contenedora. */
const GAP_PX = 6;

/**
 * Recorta una fila de tags **proyectados** por el ancho real de su contenedor: descubre los tags vía
 * `contentChildren`, oculta los que no entran (`visibility:hidden`) y expone cuántos quedan visibles
 * (`visibleCount`), cuántos se colapsan (`hiddenCount`) y dónde ubicar el contador "+N" (`counterLeft`).
 *
 * Pensada como `hostDirective` del contenedor (que debe ser `position: relative; overflow: hidden`): su
 * host es el contenedor y el root del observer. Usa `IntersectionObserver` (con un margen derecho que
 * reserva el contador) en lugar de `ResizeObserver` por restricción de diseño; reacciona a cualquier
 * cambio de ancho del contenedor. Los tags ocultos quedan en el flujo con `visibility:hidden` (no
 * `display:none`): así no alteran el layout y siguen siendo observables (recorte bidireccional).
 *
 * Sin layout (SSR/jsdom) el observer no reporta y se consideran todos visibles (acotados por `maxVisible`).
 */
@Directive({})
export class TagsOverflowDirective {
	/** Tope duro opcional de tags visibles; sin valor, el único límite es el ancho. */
	readonly maxVisible = input<number>();

	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly renderer = inject(Renderer2);
	private readonly destroyRef = inject(DestroyRef);

	/** Tags proyectados a recortar, en orden de render. */
	private readonly items = contentChildren(TagComponent, { read: ElementRef });

	// Elementos que NO entran completos en el contenedor (reservando el contador), según el observer.
	private readonly overflowing = new WeakSet<Element>();
	private readonly overflowVersion = signal(0);
	private readonly observer = signal<IntersectionObserver | undefined>(undefined);

	/** Cantidad de tags visibles: prefijo que entra, acotado por `maxVisible`. */
	readonly visibleCount = computed(() => {
		this.overflowVersion(); // dependencia: recalcula cuando el observer reporta cambios
		const cap = this.maxVisible() ?? Infinity;
		let count = 0;
		for (const ref of this.items()) {
			if (count >= cap || this.overflowing.has(ref.nativeElement)) {
				break;
			}
			count++;
		}
		return count;
	});

	/** Cantidad de tags colapsados detrás del contador "+N". */
	readonly hiddenCount = computed(() => Math.max(0, this.items().length - this.visibleCount()));

	/**
	 * Posición izquierda (px, relativa al host) del contador: borde derecho del último tag visible más el
	 * gap. Lo ubica justo después del último tag, con ancho fijo (su contenido), sin estirarse al borde.
	 */
	readonly counterLeft = signal(0);
	private readonly counterPositionEffect = effect(() => {
		const count = this.visibleCount();
		const items = this.items();
		const last = count > 0 ? items[count - 1]?.nativeElement : undefined;
		this.counterLeft.set(last ? last.offsetLeft + last.offsetWidth + GAP_PX : 0);
	});

	// Oculta/muestra los tags proyectados según el recorte (la directiva es dueña de su visibilidad).
	private readonly applyVisibilityEffect = effect(() => {
		const count = this.visibleCount();
		this.items().forEach((ref, i) => {
			if (i >= count) {
				this.renderer.setStyle(ref.nativeElement, 'visibility', 'hidden');
			} else {
				this.renderer.removeStyle(ref.nativeElement, 'visibility');
			}
		});
	});

	// (Re)observa los tags cuando el observer está listo o cambia la lista proyectada.
	private readonly observeEffect = effect(() => {
		const observer = this.observer();
		if (!observer) {
			return;
		}
		observer.disconnect();
		for (const ref of this.items()) {
			observer.observe(ref.nativeElement);
		}
	});

	constructor() {
		afterNextRender(() => {
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.intersectionRatio >= 0.99) {
							this.overflowing.delete(entry.target);
						} else {
							this.overflowing.add(entry.target);
						}
					}
					this.overflowVersion.update((v) => v + 1);
				},
				{
					root: this.host.nativeElement,
					threshold: 1,
					rootMargin: `0px -${COUNTER_RESERVE_PX}px 0px 0px`,
				},
			);
			this.observer.set(observer);
			this.destroyRef.onDestroy(() => observer.disconnect());
		});
	}
}
