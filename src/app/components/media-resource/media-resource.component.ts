import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Media } from '@models/media.model';
import { toMediaWidgetOutlet } from '@components/media-widgets/media-widget-registry';

/**
 * @deprecated Usar `MediaWidgetSelector`, que ofrece los formatos y monta solo el elegido.
 * Este despachador monta todos los medios de una obra a la vez, la política que la página de Story
 * todavía espera; ya no tiene catálogo propio —lo toma de `mediaWidgetRegistry`—, así que lo único
 * que queda acá es esa política. Se elimina al reemplazar esa página por `ReadPage`.
 */
@Component({
	selector: 'cuentoneta-media-resource',
	imports: [CommonModule],
	template: ` @for (media of mediaResources(); track $index) {
		<ng-container *ngComponentOutlet="media.component; inputs: media.inputs" />
	}`,
	host: {
		class: 'mb-10 block w-full',
	},
})
export class MediaResourceComponent {
	public readonly mediaResources = input.required({
		transform: (media: Media[]) => media.map((item) => toMediaWidgetOutlet(item)),
	});
}
