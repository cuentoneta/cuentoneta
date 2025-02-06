import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media, MediaTypeKey } from '@models/media.model';
import { MediaResourcePlatform, MediaResourceTagComponent } from '../media-resource-tag/media-resource-tag.component';

@Component({
	selector: 'cuentoneta-media-resource-tags',
	imports: [CommonModule, MediaResourceTagComponent],
	template: ` @for (mediaResource of resources(); track $index) {
		<cuentoneta-media-resource-tag [platform]="platforms[mediaResource.type]" />
	}`,
})
export class MediaResourceTagsComponent {
	resources = input<Media[]>([]);
	size = input<'md' | 'lg'>('md');

	platforms: { [key in MediaTypeKey]: MediaResourcePlatform } = {
		audioRecording: {
			title: 'Contiene narraciones en audio',
			icon: 'assets/svg/waveform.svg',
		},
		spaceRecording: {
			title: 'Contiene grabaciones de Spaces de X',
			icon: 'assets/svg/twitter.svg',
		},
		youTubeVideo: {
			title: 'Contiene videos de YouTube',
			icon: 'assets/svg/video.svg',
		},
	};
}
