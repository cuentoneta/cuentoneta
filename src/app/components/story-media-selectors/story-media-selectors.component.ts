import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { simpleSpotify, simpleX, simpleYoutube } from '@ng-icons/simple-icons';
import { faSolidFileAudio } from '@ng-icons/font-awesome/solid';

import { Media, MediaTypeKey } from '@models/media.model';

/**
 * Tema visual de los selectores, desacoplado de las variantes de StoryCardTeaserV3:
 *
 * - `subtle`: pensado para fondos blancos.
 * - `solid`: pensado para fondos grises/contenedores.
 * - `bordered`: pensado para tarjetas destacadas.
 */
export type StoryMediaSelectorsTheme = 'subtle' | 'solid' | 'bordered';

interface MediaSelectorItem {
	iconName: string;
	label: string;
	count: number;
	media?: Media;
}

/**
 * Renderiza los selectores de los recursos multimedia asociados a una
 * historia. Es un componente de presentación: no monta los widgets de los recursos, solo emite el
 * recurso seleccionado para que el componente padre decida qué renderizar.
 *
 * Comportamiento según el input `selectable`:
 *
 * - `false` (por defecto): los recursos se agrupan por plataforma y se muestra un contador (badge)
 *   cuando hay más de uno del mismo tipo. Los selectores son decorativos (no clickeables). Es el
 *   modo usado por la tarjeta StoryCardTeaserV3.
 * - `true`: se renderiza un selector clickeable por cada recurso (sin agrupar ni contador) y al
 *   hacer click se emite, vía el output `selected`, el `Media` correspondiente. Es el modo pensado
 *   para la vista Story, donde se monta el widget del recurso seleccionado.
 */
@Component({
	selector: 'cuentoneta-story-media-selectors',
	imports: [NgIcon],
	providers: [provideIcons({ simpleYoutube, simpleX, simpleSpotify, faSolidFileAudio })],
	template: `
		@for (selector of selectors(); track $index) {
			@if (selectable()) {
				<button
					(click)="selected.emit(selector.media!)"
					[class]="selectorClasses()"
					[attr.aria-label]="selector.label"
					type="button"
					class="relative flex items-center justify-center rounded-lg px-2.5 py-2"
					data-testid="media-selector"
				>
					<ng-icon [name]="selector.iconName" size="18px" class="text-neutral-900" />
				</button>
			} @else {
				<div
					[class]="selectorClasses()"
					class="relative flex items-center justify-center rounded-lg px-2.5 py-2"
					data-testid="media-selector"
				>
					<ng-icon [name]="selector.iconName" [attr.aria-label]="selector.label" size="18px" class="text-neutral-900" />
					@if (selector.count > 1) {
						<span
							[class]="badgeClasses()"
							class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-[10px] font-inter text-xxs font-bold text-neutral-900"
						>
							{{ selector.count }}
						</span>
					}
				</div>
			}
		}
	`,
	host: {
		'[class]': 'containerClasses()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryMediaSelectorsComponent {
	// Inputs
	readonly media = input<Media[]>([]);
	readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
	readonly theme = input<StoryMediaSelectorsTheme>('subtle');
	readonly selectable = input<boolean>(false);

	readonly selected = output<Media>();

	// Mapeo de cada tipo de media del dominio a su ícono y etiqueta accesible.
	private readonly mediaPlatforms: Record<MediaTypeKey, { iconName: string; label: string }> = {
		youTubeVideo: { iconName: 'simpleYoutube', label: 'YouTube' },
		spaceRecording: { iconName: 'simpleX', label: 'Spaces de X' },
		spotifyPodcastEpisode: { iconName: 'simpleSpotify', label: 'Spotify' },
		audioRecording: { iconName: 'faSolidFileAudio', label: 'Audio' },
	};

	readonly selectors = computed<MediaSelectorItem[]>(() => {
		const media = this.media();
		if (this.selectable()) {
			return media.map((item) => ({ ...this.mediaPlatforms[item.type], count: 1, media: item }));
		}
		const counts = new Map<MediaTypeKey, number>();
		for (const item of media) {
			counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
		}
		return [...counts.entries()].map(([type, count]) => ({ ...this.mediaPlatforms[type], count }));
	});

	readonly containerClasses = computed(() =>
		this.orientation() === 'vertical' ? 'flex flex-col items-center gap-2.5' : 'flex items-center gap-2.5',
	);

	// Estilos del recuadro de cada selector según el tema.
	readonly selectorClasses = computed(() => {
		switch (this.theme()) {
			case 'solid':
				return 'bg-white';
			case 'bordered':
				return 'border border-neutral-150 bg-white';
			default:
				return 'bg-neutral-100';
		}
	});

	// Estilos del contador (badge) que se superpone al selector según el tema.
	readonly badgeClasses = computed(() => {
		switch (this.theme()) {
			case 'solid':
				return 'border-2 border-neutral-100 bg-white';
			case 'bordered':
				return 'border border-neutral-150 bg-white';
			default:
				return 'border-2 border-white bg-neutral-100';
		}
	});
}
