import { Component, input } from '@angular/core';

import { YouTubeVideo } from '@models/media.model';
import { YouTubePlayer } from '@angular/youtube-player';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-youtube-video-widget',
	imports: [YouTubePlayer, PortableTextParserComponent],
	template: `<youtube-player
			[videoId]="media().data.videoId"
			data-testid="youtube-player"
			placeholderImageQuality="low"
		/>
		<p class="inter-body-xs-medium text-primary-500">
			<cuentoneta-portable-text-parser [paragraphs]="media().description" />
		</p>`,
	styles: `
		::ng-deep {
			youtube-player {
				.youtube-player-placeholder,
				div iframe {
					@apply mb-2 aspect-video w-full rounded-xl !important;
					height: unset !important;
				}
			}
		}
	`,
})
export class YoutubeVideoWidgetComponent {
	readonly media = input.required<YouTubeVideo>();
}
