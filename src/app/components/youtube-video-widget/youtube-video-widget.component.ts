import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubeVideo } from '@models/media.model';
import { YouTubePlayer } from '@angular/youtube-player';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-youtube-video-widget',
	standalone: true,
	imports: [CommonModule, YouTubePlayer, PortableTextParserComponent],
	template: `<youtube-player [videoId]="media().data.videoId" placeholderImageQuality="low" />
		<label class="inter-body-xs-medium text-primary-500"
			><cuentoneta-portable-text-parser [paragraphs]="media().description"> </cuentoneta-portable-text-parser
		></label>`,
	styles: `
		::ng-deep {
			youtube-player {
				.youtube-player-placeholder,
				div iframe {
					@apply mb-2 aspect-video w-full rounded-xl  #{!important};
					height: unset !important;
				}
			}
		}
	`,
})
export class YoutubeVideoWidgetComponent {
	media = input.required<YouTubeVideo>();
}
