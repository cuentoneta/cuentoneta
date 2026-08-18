import { Component, computed, input, linkedSignal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Media } from '@models/media.model';
import { MediaSelectorGroup } from './media-selector-group.component';
import { toMediaWidget } from './media-widget.map';

/**
 * Ofrece los formatos alternativos en que se puede consumir una obra y monta el widget del que está
 * elegido.
 *
 * La botonera aparece solo cuando hay más de un medio: con uno solo no hay elección que ofrecer, y el
 * widget se monta directo. El título, en cambio, se muestra siempre que haya al menos un medio, y
 * cambia de texto según haya o no elección.
 */
@Component({
	selector: 'cuentoneta-media-widget-selector',
	imports: [MediaSelectorGroup, NgComponentOutlet],
	host: { class: 'block' },
	template: `
		@if (mediaSources().length > 0) {
			<section class="flex flex-col gap-5">
				<h2 class="font-inter text-xl font-bold text-neutral-900">{{ heading() }}</h2>

				@if (selected(); as selected) {
					@if (hasChoice()) {
						<cuentoneta-media-selector-group
							(selected)="select($event)"
							[current]="selected"
							[mediaSources]="mediaSources()"
						/>
					}
					@if (selectedWidget(); as widget) {
						<ng-container *ngComponentOutlet="widget.component; inputs: widget.inputs" />
					}
				}
			</section>
		}
	`,
})
export class MediaWidgetSelector {
	public readonly mediaSources = input<readonly Media[]>([]);

	protected readonly hasChoice = computed(() => this.mediaSources().length > 1);

	protected readonly heading = computed(() =>
		this.hasChoice()
			? 'Disfrutá de esta obra en diferentes formatos'
			: 'También podés disfrutar de esta obra en otro formato',
	);

	// La elección vuelve al primer medio cuando cambia la obra: sostenerla entre obras dejaría montado un
	// widget que ya no pertenece a la que se está leyendo.
	protected readonly selected = linkedSignal({
		source: this.mediaSources,
		computation: (mediaSources) => mediaSources[0],
	});

	protected readonly selectedWidget = computed(() => {
		const selected = this.selected();
		return selected ? toMediaWidget(selected) : undefined;
	});

	protected select(mediaSource: Media): void {
		this.selected.set(mediaSource);
	}
}
