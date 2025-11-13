import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Models
import { SpotifyPodcastEpisode } from '@models/media.model';

// Components
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-spotify-audio-widget',
	imports: [PortableTextParserComponent],
	template: `
		<iframe
			[src]="mediaUrl()"
			width="100%"
			height="152"
			frameborder="0"
			allowfullscreen=""
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
			data-testid="spotify-embed"
			class="mb-2 block"
		></iframe>
		<cuentoneta-portable-text-parser [paragraphs]="media().description" class="inter-body-xs-medium text-primary-500" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpotifyPodcastEpisodeWidget {
	readonly media = input.required<SpotifyPodcastEpisode>();
	private readonly sanitizer = inject(DomSanitizer);

	readonly mediaUrl = computed((): SafeResourceUrl => {
		const spotifyUrl = this.media().data.url;
		// Transformar URL a formato embedded en caso de que sea necesario
		// e.g., https://open.spotify.com/episode/xxx -> https://open.spotify.com/embed/episode/xxx
		let embedUrl = spotifyUrl;
		if (spotifyUrl.includes('/episode/')) {
			embedUrl = spotifyUrl.replace(/open\.spotify\.com\/(episode\/)/, 'open.spotify.com/embed/$1');
		}
		return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
	});
}
