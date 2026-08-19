import { Component, computed, input, linkedSignal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { simpleSpotify, simpleX, simpleYoutube } from '@ng-icons/simple-icons';
import { faSolidFileAudio } from '@ng-icons/font-awesome/solid';

import type { Media, MediaTypeKey } from '@models/media.model';
import { ButtonGroupComponent, type ButtonGroupOption } from '@components/button-group/button-group.component';
import { toMediaWidgetOutlet } from '@components/media-widgets/media-widget-registry';

/**
 * Ofrece los formatos alternativos en que se puede consumir una obra y monta el widget del elegido.
 *
 * Hay un botón por recurso, no por formato: una obra que trae dos videos ofrece los dos. La fila
 * aparece solo con más de un recurso —con uno no hay elección que ofrecer y el widget se monta
 * directo—, mientras que el título se muestra siempre que haya al menos uno y cambia de texto según
 * haya o no elección.
 *
 * El vocabulario de la pantalla —qué ícono y qué etiqueta le toca a cada tipo de medio— vive acá y
 * no en el Design System: `ButtonGroup` resuelve los nombres de ícono por el injector y no conoce
 * los formatos de una obra.
 */
@Component({
	selector: 'cuentoneta-media-widget-selector',
	imports: [ButtonGroupComponent, NgComponentOutlet],
	providers: [provideIcons({ faSolidFileAudio, simpleX, simpleYoutube, simpleSpotify })],
	host: { class: 'block' },
	template: `
		@if (options().length > 0) {
			<section class="flex flex-col gap-5" aria-labelledby="media-formats-heading">
				<h2 id="media-formats-heading" class="font-inter text-xl font-bold text-neutral-900">{{ heading() }}</h2>

				@if (hasChoice()) {
					<cuentoneta-button-group
						(optionSelected)="selectedId.set($event)"
						[options]="options()"
						[selectedId]="selectedId()"
						label="Formatos disponibles"
						size="sm"
					/>
				}
				@if (selectedWidget(); as widget) {
					<ng-container *ngComponentOutlet="widget.component; inputs: widget.inputs" />
				}
			</section>
		}
	`,
})
export class MediaWidgetSelector {
	public readonly mediaSources = input<readonly Media[]>([]);

	private readonly mediaTypes: Record<MediaTypeKey, { icon: string; label: string }> = {
		audioRecording: { icon: 'faSolidFileAudio', label: 'Audiolibro' },
		spaceRecording: { icon: 'simpleX', label: 'X' },
		spotifyPodcastEpisode: { icon: 'simpleSpotify', label: 'Spotify' },
		youTubeVideo: { icon: 'simpleYoutube', label: 'YouTube' },
	};

	// La lista es la única derivación: de acá salen tanto las opciones que consume el grupo como el
	// widget que se monta, así que no hay dos vistas del mismo dato que puedan desincronizarse.
	// El id compone tipo e índice, con lo que queda único por construcción — el grupo deja vigentes
	// a la vez a dos opciones que compartan id.
	private readonly entries = computed(() => {
		const mediaSources = this.mediaSources();
		const repeatedTypes = new Set(
			mediaSources.map((media) => media.type).filter((type, index, types) => types.indexOf(type) !== index),
		);

		return mediaSources.map((media, index) => {
			// Mismo corte que hace el registry al resolver el widget: el tag viaja desde el CMS y nadie
			// lo valida en el borde, así que un tipo publicado antes de que la pantalla sepa nombrarlo
			// tiene que fallar diciendo cuál es, y no como un TypeError al desestructurar.
			const vocabulary = this.mediaTypes[media.type];
			if (!vocabulary) {
				throw new Error(`El tipo ${media.type} no está soportado.`);
			}

			const { icon, label } = vocabulary;
			return {
				media,
				id: `${media.type}-${index}`,
				// El nombre del formato deja de distinguir en cuanto el tipo se repite, y ahí el
				// título del medio es lo único que diferencia un botón del otro.
				label: repeatedTypes.has(media.type) ? media.title : label,
				iconName: icon,
			};
		});
	});

	protected readonly options = computed<ButtonGroupOption[]>(() =>
		this.entries().map(({ id, label, iconName }) => ({ id, label, iconName })),
	);

	// Sobre las opciones y no sobre los medios: es la misma lista que dibuja la fila, así que el
	// título no puede anunciar una elección que la fila no ofrece.
	protected readonly hasChoice = computed(() => this.options().length > 1);

	protected readonly heading = computed(() =>
		this.hasChoice()
			? 'Disfrutá de esta obra en diferentes formatos'
			: 'También podés disfrutar de esta obra en otro formato',
	);

	// La elección vuelve al primer recurso cuando cambia la obra: sostenerla entre obras dejaría
	// montado un widget que ya no pertenece a la que se está leyendo.
	protected readonly selectedId = linkedSignal({
		source: this.entries,
		computation: (entries) => entries[0]?.id,
	});

	protected readonly selectedWidget = computed(() => {
		const selected = this.entries().find((entry) => entry.id === this.selectedId());
		return selected ? toMediaWidgetOutlet(selected.media) : undefined;
	});
}
