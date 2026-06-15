import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { TagComponent, TagVariant } from '../tag/tag.component';
import { TagsOverflowDirective } from './tags-overflow.directive';

/**
 * Lista de tags del Design System v3. Los tags se **proyectan** (`<ng-content>`) y, cuando no entran en
 * el ancho del contenedor, se colapsa el excedente detrás de un contador "+N" de ancho fijo ubicado
 * justo después del último tag visible.
 *
 * Toda la lógica de recorte por ancho vive en {@link TagsOverflowDirective}, aplicada como `hostDirective`
 * (el propio host del componente es el contenedor/root del observer — sin `<div>` wrapper). El componente
 * solo proyecta el contenido, renderiza el contador y expone `maxVisible` (vía la hostDirective). El
 * `variant` aplica al contador (los tags proyectados llevan el suyo).
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
			<!-- Un tag más, in-flow: la directiva ordena (flex order) los ocultos después, así cae justo
				 a la derecha del último visible, con el gap natural de la fila. -->
			<cuentoneta-tag [label]="'+' + overflow.hiddenCount()" [variant]="variant()" data-testid="tags-overflow" />
		}
	`,
	host: { class: 'relative flex items-center gap-1.5 overflow-hidden' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsListComponent {
	/** Variante del contador "+N" (los tags proyectados llevan la suya). */
	readonly variant = input<TagVariant>('filled');

	protected readonly overflow = inject(TagsOverflowDirective);
}
