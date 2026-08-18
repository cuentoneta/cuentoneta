import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { simpleSpotify, simpleX, simpleYoutube } from '@ng-icons/simple-icons';
import { faSolidFileAudio } from '@ng-icons/font-awesome/solid';

import type { Media, MediaTypeKey } from '@models/media.model';
import { ButtonComponent } from '@components/button/button.component';

/**
 * La fila de opciones de formato de `MediaWidgetSelector`: un botón por medio, con el elegido marcado.
 *
 * Existe solo para ese componente y no se ofrece al resto de la app. Lo que sostiene es el vocabulario
 * de esta pantalla —qué ícono y qué etiqueta le corresponde a cada tipo de medio, y que la elección es
 * excluyente—, que es exactamente lo que no debe vivir dentro del Button: ahí abajo solo hay una
 * apariencia, una geometría y un estado, sin saber que existen los formatos de una obra.
 *
 * Es de presentación: no decide qué queda elegido, lo emite y espera que el padre se lo vuelva a pasar.
 */
@Component({
	selector: 'cuentoneta-media-selector-group',
	imports: [ButtonComponent, NgIcon],
	providers: [provideIcons({ faSolidFileAudio, simpleX, simpleYoutube, simpleSpotify })],
	host: { class: 'block' },
	template: `
		<div class="flex flex-wrap items-center gap-3" role="group" aria-label="Formatos disponibles">
			@for (mediaSource of mediaSources(); track mediaSource.title) {
				@let mediaType = mediaTypes[mediaSource.type];
				<button
					(click)="selected.emit(mediaSource)"
					[active]="mediaSource === current()"
					[attr.aria-pressed]="mediaSource === current()"
					cuentoneta-button
					size="sm"
					type="outline"
				>
					<ng-icon [name]="mediaType.icon" />
					{{ mediaType.label }}
				</button>
			}
		</div>
	`,
})
export class MediaSelectorGroup {
	public readonly mediaSources = input.required<readonly Media[]>();
	public readonly current = input.required<Media>();
	public readonly selected = output<Media>();

	protected readonly mediaTypes: Record<MediaTypeKey, { icon: string; label: string }> = {
		audioRecording: { icon: 'faSolidFileAudio', label: 'Audiolibro' },
		spaceRecording: { icon: 'simpleX', label: 'X' },
		spotifyPodcastEpisode: { icon: 'simpleSpotify', label: 'Spotify' },
		youTubeVideo: { icon: 'simpleYoutube', label: 'YouTube' },
	};
}
