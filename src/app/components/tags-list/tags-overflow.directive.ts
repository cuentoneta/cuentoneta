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

/**
 * Recorta una fila de tags **proyectados** por el ancho real de su contenedor: descubre los tags vía
 * `contentChildren`, oculta los que no entran (`visibility:hidden`) y los empuja *después* del contador
 * con flex `order`; expone cuántos quedan visibles (`visibleCount`) y cuántos se colapsan (`hiddenCount`).
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
	private readonly overflowing = signal<ReadonlySet<Element>>(new Set());
	private readonly observer = signal<IntersectionObserver | undefined>(undefined);

	/** Cantidad de tags visibles: prefijo que entra, acotado por `maxVisible`. */
	readonly visibleCount = computed(() => {
		const overflowing = this.overflowing();
		const cap = this.maxVisible() ?? Infinity;
		let count = 0;
		for (const ref of this.items()) {
			if (count >= cap || overflowing.has(ref.nativeElement)) {
				break;
			}
			count++;
		}
		return count;
	});

	/** Cantidad de tags colapsados detrás del contador "+N". */
	readonly hiddenCount = computed(() => Math.max(0, this.items().length - this.visibleCount()));

	// La directiva es dueña del layout de overflow de los tags proyectados:
	// - los ocultos se esconden (`visibility:hidden`; quedan en el flujo y observables) y se empujan
	//   *después* del contador con flex `order` = cantidad de visibles a su izquierda + 1, de modo que el
	//   contador "+N" —un tag más, in-flow— caiga justo a la derecha del último visible sin medir nada.
	// - los visibles vuelven a su estado por defecto (`order` 0, visible).
	private readonly applyOverflowEffect = effect(() => {
		const count = this.visibleCount();
		this.items().forEach((ref, i) => {
			if (i >= count) {
				this.renderer.setStyle(ref.nativeElement, 'order', `${count + 1}`);
				this.renderer.setStyle(ref.nativeElement, 'visibility', 'hidden');
			} else {
				this.renderer.removeStyle(ref.nativeElement, 'order');
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
			/** Espacio (px) reservado a la derecha para el contador "+N" al decidir qué ítems entran. */
			const COUNTER_RESERVE_PX = 44;
			const observer = new IntersectionObserver(
				(entries) => {
					this.overflowing.update((prev) => {
						const next = new Set(prev);
						for (const entry of entries) {
							if (entry.intersectionRatio >= 0.99) {
								next.delete(entry.target);
							} else {
								next.add(entry.target);
							}
						}
						return next;
					});
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
