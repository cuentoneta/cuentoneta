import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { simpleSpotify, simpleX, simpleYoutube } from '@ng-icons/simple-icons';
import { faSolidFileAudio } from '@ng-icons/font-awesome/solid';

import { MediaTeaser, MediaTypeKey } from '@models/media.model';

/**
 * Tema visual de los selectores, desacoplado de las variantes de las tarjetas consumidoras:
 *
 * - `subtle`: pensado para fondos blancos.
 * - `solid`: pensado para fondos grises/contenedores.
 * - `bordered`: pensado para tarjetas destacadas.
 */
export type MediaSelectorsTheme = 'subtle' | 'solid' | 'bordered';

interface MediaSelectorItem {
	iconName: string;
	label: string;
	count: number;
	media?: MediaTeaser;
}

/**
 * Renderiza los selectores de los recursos multimedia asociados a una obra. Es un componente de
 * presentación: no monta los widgets de los recursos, solo emite cuál quedó elegido para que el
 * componente padre decida qué renderizar.
 *
 * Consume la **vista de teaser** del medio: el tag para elegir el ícono y el título para nombrar el
 * recurso. Por eso lo que emite no alcanza para montar un widget: quien lo monte tiene que resolver
 * la vista completa por su cuenta.
 *
 * Comportamiento según el input `selectable`:
 *
 * - `false` (por defecto): los recursos se agrupan por plataforma y se muestra un contador (badge)
 *   cuando hay más de uno del mismo tipo. Los selectores son decorativos (no clickeables). Es el
 *   modo usado por las tarjetas LiteraryWorkTeaserCard y LiteraryWorkTeaserHomeCard.
 * - `true`: se renderiza un selector clickeable por cada recurso (sin agrupar ni contador) y al
 *   hacer click se emite, vía el output `selected`, el `MediaTeaser` correspondiente. Es el modo
 *   pensado para una vista que monte el widget del recurso elegido.
 */
@Component({
	selector: 'cuentoneta-media-selectors',
	imports: [NgIcon],
	providers: [provideIcons({ simpleYoutube, simpleX, simpleSpotify, faSolidFileAudio })],
	template: `
		@for (selector of selectors(); track $index) {
			@if (selectable()) {
				<button
					(click)="selected.emit(selector.media!)"
					[class]="selectorClasses()"
					[attr.aria-label]="ariaLabel(selector)"
					type="button"
					data-testid="media-selector"
				>
					<ng-icon [name]="selector.iconName" size="18px" class="text-neutral-900" />
				</button>
			} @else {
				<div
					[class]="selectorClasses()"
					[attr.aria-label]="ariaLabel(selector)"
					role="img"
					data-testid="media-selector"
				>
					<ng-icon [name]="selector.iconName" [attr.aria-label]="selector.label" size="18px" class="text-neutral-900" />
					@if (selector.count > 1) {
						<span
							[class]="badgeClasses()"
							class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-[10px] font-inter text-xxs font-bold text-neutral-900"
							aria-hidden="true"
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
})
export class MediaSelectorsComponent {
	// Solo lee la colección, así que la acepta de solo lectura: es como la exponen las proyecciones
	// de LiteraryWork.
	public readonly media = input<readonly MediaTeaser[]>([]);
	public readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
	public readonly theme = input<MediaSelectorsTheme>('subtle');
	public readonly selectable = input<boolean>(false);

	public readonly selected = output<MediaTeaser>();

	private readonly mediaPlatforms: Record<MediaTypeKey, { iconName: string; label: string }> = {
		youTubeVideo: { iconName: 'simpleYoutube', label: 'YouTube' },
		spaceRecording: { iconName: 'simpleX', label: 'Spaces de X' },
		spotifyPodcastEpisode: { iconName: 'simpleSpotify', label: 'Spotify' },
		audioRecording: { iconName: 'faSolidFileAudio', label: 'Audio' },
	};

	protected readonly selectors = computed<MediaSelectorItem[]>(() => {
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

	protected readonly containerClasses = computed(() =>
		this.orientation() === 'vertical' ? 'flex flex-col items-center gap-2.5' : 'flex items-center gap-2.5',
	);

	private readonly selectorBaseClasses = 'relative flex items-center justify-center rounded-lg px-2.5 py-2';

	protected readonly selectorClasses = computed(() => {
		const theme = (() => {
			switch (this.theme()) {
				case 'solid':
					return 'bg-white';
				case 'bordered':
					return 'border border-neutral-150 bg-white';
				default:
					return 'bg-neutral-100';
			}
		})();
		return `${this.selectorBaseClasses} ${theme}`;
	});

	// Nombre accesible del selector. En modo agrupado incluye el conteo, de modo que el badge visual
	// pueda marcarse como decorativo (aria-hidden). En modo seleccionable cada botón es un recurso
	// distinto, así que nombra el suyo: entre dos de la misma plataforma, la etiqueta sola no los
	// distingue.
	protected ariaLabel(selector: MediaSelectorItem): string {
		if (selector.media) {
			return `${selector.label}: ${selector.media.title}`;
		}
		return selector.count > 1 ? `${selector.label} (${selector.count})` : selector.label;
	}

	protected readonly badgeClasses = computed(() => {
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
