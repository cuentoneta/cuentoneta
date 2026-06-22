import {
	ChangeDetectionStrategy,
	Component,
	computed,
	contentChildren,
	effect,
	ElementRef,
	inject,
	PLATFORM_ID,
	viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { TagComponent } from '../tag/tag.component';
import { TagsOverflowDirective } from './tags-overflow.directive';

/**
 * Lista de tags del Design System v3. Los tags se proyectan (`<ng-content>`) y, cuando no entran en el
 * ancho del contenedor, se colapsa el excedente detrás de un contador "+N" ubicado tras el último visible.
 *
 * La lógica de recorte vive en `TagsOverflowDirective`, aplicada como `hostDirective` (el host del
 * componente es el contenedor — sin `<div>` wrapper). El componente proyecta el contenido, renderiza el
 * contador (toma la variante de los tags proyectados) y le mide el ancho a la directiva para que reserve
 * su espacio. `maxVisible` se expone vía la hostDirective.
 *
 * Uso:
 * ```html
 * <cuentoneta-tags-list [maxVisible]="3">
 *   @for (tag of tags(); track tag.slug) {
 *     <cuentoneta-tag [label]="tag.title" variant="filled" />
 *   }
 * </cuentoneta-tags-list>
 * ```
 */
@Component({
	selector: 'cuentoneta-tags-list',
	imports: [TagComponent],
	hostDirectives: [{ directive: TagsOverflowDirective, inputs: ['maxVisible'] }],
	template: `
		<ng-content />
		@if (overflow.hiddenCount() > 0) {
			<cuentoneta-tag
				[label]="'+' + overflow.hiddenCount()"
				[variant]="counterVariant()"
				[attr.aria-label]="overflow.hiddenCount() + ' etiquetas más'"
				#counter
				data-testid="tags-overflow"
			/>
		}
	`,
	host: { class: 'flex items-center gap-1.5 overflow-hidden' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsListComponent {
	protected readonly overflow = inject(TagsOverflowDirective);
	private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	private readonly projectedTags = contentChildren(TagComponent);
	private readonly counter = viewChild('counter', { read: ElementRef });

	/** El contador "+N" toma la variante de los tags proyectados (todos suelen compartirla). */
	protected readonly counterVariant = computed(() => this.projectedTags()[0]?.variant() ?? 'filled');

	// Mide el ancho real del contador (más el gap de la fila) y se lo pasa a la directiva como reserva (se
	// re-mide al aparecer el contador o cambiar su "+N"). El feedback reserva → recorte → "+N" se rompe por
	// el callback asíncrono del observer, y un `set` con el mismo valor no recrea el observer.
	private readonly measureReserveSpace = effect(() => {
		const counter = this.counter()?.nativeElement as HTMLElement | undefined;
		this.overflow.hiddenCount();
		if (!this.isBrowser || !counter) {
			this.overflow.reserveTrailingSpace(0);
			return;
		}
		const gap = parseFloat(getComputedStyle(this.hostRef.nativeElement).columnGap) || 0;
		this.overflow.reserveTrailingSpace(counter.offsetWidth + gap);
	});
}
