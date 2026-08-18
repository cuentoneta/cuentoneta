import { Component, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import type { Media } from '@models/media.model';
import { toMediaWidget } from '@components/media-widget-selector/media-widget.map';

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
