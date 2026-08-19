import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Media } from '@models/media.model';
import { toMediaWidgetOutlet } from '@components/media-widgets/media-widget-registry';

/**
 * @deprecated Monta **todos** los medios de una obra a la vez, que es la política de las páginas de
 * Story y Storylist. La página de lectura monta solo el elegido y resuelve su widget por
 * `mediaWidgetRegistry`. Este despachador sobrevive solo mientras esas dos páginas lo consuman; se
 * elimina junto con ellas.
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
