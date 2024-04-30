import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubeVideo } from '@models/media.model';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
	selector: 'cuentoneta-youtube-video-widget',
	standalone: true,
	imports: [CommonModule, YouTubePlayer],
	template: `<youtube-player [videoId]="media().data.videoId" placeholderImageQuality="low" />`,
})
export class YoutubeVideoWidgetComponent {
	media = input.required<YouTubeVideo>();
}
