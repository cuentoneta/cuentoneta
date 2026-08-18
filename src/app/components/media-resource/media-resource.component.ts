import { Component, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import type { Media } from '@models/media.model';
import { toMediaWidget } from '@components/media-widget-selector/media-widget.map';

/**
 * @deprecated Usar `MediaWidgetSelector`, que ofrece los formatos y monta solo el elegido. Este
 * despachador monta todos los medios de una obra a la vez, la política que las páginas de Story y
 * Storylist todavía esperan; ya no tiene catálogo propio —lo toma de `MEDIA_WIDGETS`—, así que lo
 * único que queda acá es esa política. Se elimina al reemplazar esas páginas por `ReadPage`.
 */
@Component({
	selector: 'cuentoneta-media-resource',
	imports: [NgComponentOutlet],
	template: ` @for (media of mediaResources(); track $index) {
		<ng-container *ngComponentOutlet="media.component; inputs: media.inputs" />
	}`,
	host: {
		class: 'mb-10 block w-full',
	},
})
export class MediaResourceComponent {
	public readonly mediaResources = input.required({
		transform: (media: Media[]) => media.map(toMediaWidget),
	});
}
