import { Component, input, ViewEncapsulation } from '@angular/core';

import { YouTubeVideo } from '@models/media.model';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
	selector: 'cuentoneta-youtube-video-widget',
	imports: [YouTubePlayer],
	encapsulation: ViewEncapsulation.None,
	template: `
		<figure>
			<youtube-player [videoId]="media().data.videoId" data-testid="youtube-player" placeholderImageQuality="low" />
			<figcaption
				[innerHTML]="media().description"
				data-testid="media-description"
				class="font-inter text-xs font-medium text-brand-500"
			></figcaption>
		</figure>
	`,
	styles: `
		@reference '#tailwind-theme';

		cuentoneta-youtube-video-widget {
			youtube-player {
				.youtube-player-placeholder,
				div iframe {
					@apply mb-2! aspect-video! w-full! rounded-xl!;
					height: unset !important;
				}
			}
		}
	`,
})
export class YoutubeVideoWidgetComponent {
	public readonly media = input.required<YouTubeVideo>();
}
