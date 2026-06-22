import {
	afterNextRender,
	computed,
	contentChildren,
	Directive,
	effect,
	ElementRef,
	inject,
	input,
	Renderer2,
	signal,
} from '@angular/core';

import { TagComponent } from '../tag/tag.component';

// Ratio de intersección a partir del cual se considera que un tag entra completo (tolerancia sub-pixel).
const FULLY_VISIBLE_RATIO = 0.99;

/**
 * Recorta una fila de tags proyectados según el ancho de su contenedor: descubre los tags vía
 * `contentChildren`, oculta los que no entran (`visibility:hidden`) y los empuja después del contador con
 * flex `order`. Expone `visibleCount` y `hiddenCount`, y recibe vía `reserveTrailingSpace()` cuánto
 * espacio guardar a la derecha (el ancho del contador "+N", que mide el host).
 *
 * Se aplica como `hostDirective` del contenedor (que debe tener `overflow: hidden`): su host es el root del
 * `IntersectionObserver` (se usa IO, no `ResizeObserver`, por restricción de diseño). Los tags ocultos
 * quedan en el flujo con `visibility:hidden` para seguir siendo observables, así el recorte reacciona en
 * ambos sentidos al cambiar el ancho. Sin layout (SSR/jsdom) no se crea el observer y entran todos.
 */
@Directive({})
export class TagsOverflowDirective {
	/** Tope duro opcional de tags visibles; sin valor, el único límite es el ancho. */
	public readonly maxVisible = input<number>();

	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly renderer = inject(Renderer2);

	private readonly items = contentChildren(TagComponent, { read: ElementRef });

	// Tags que NO entran completos en el contenedor (según el observer) y espacio reservado para el contador.
	private readonly overflowing = signal<ReadonlySet<Element>>(new Set());
	private readonly reservedSpace = signal(0);
	// El observer recién se crea tras el primer render (browser-only).
	private readonly ready = signal(false);

	/** Cantidad de tags visibles: prefijo que entra, acotado por `maxVisible`. */
	public readonly visibleCount = computed(() => {
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
	public readonly hiddenCount = computed(() => Math.max(0, this.items().length - this.visibleCount()));

	/** El host informa el ancho (px) a reservar a la derecha para el contador "+N". */
	public reserveTrailingSpace(px: number): void {
		this.reservedSpace.set(px);
	}

	// Oculta los tags que no entran y los manda (flex `order`) después del contador, que es in-flow `order 0`.
	private readonly applyOverflowEffect = effect(() => {
		const visibleCount = this.visibleCount();
		this.items().forEach((ref, i) => {
			const hidden = i >= visibleCount;
			this.renderer.setStyle(ref.nativeElement, 'order', hidden ? '1' : '0');
			this.renderer.setStyle(ref.nativeElement, 'visibility', hidden ? 'hidden' : 'visible');
		});
	});

	// (Re)crea el observer cuando cambia el espacio reservado (el `rootMargin` es inmutable por observer) o
	// la lista; `onCleanup` desconecta el anterior y limpia al destruir.
	private readonly observerEffect = effect((onCleanup) => {
		if (!this.ready()) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) =>
				this.overflowing.update((prev) => {
					const next = new Set(prev);
					for (const entry of entries) {
						if (entry.intersectionRatio >= FULLY_VISIBLE_RATIO) {
							next.delete(entry.target);
						} else {
							next.add(entry.target);
						}
					}
					return next;
				}),
			{
				root: this.host.nativeElement,
				threshold: 1,
				rootMargin: `0px -${this.reservedSpace()}px 0px 0px`,
			},
		);
		for (const ref of this.items()) {
			observer.observe(ref.nativeElement);
		}
		onCleanup(() => observer.disconnect());
	});

	constructor() {
		afterNextRender(() => this.ready.set(true));
	}
}
