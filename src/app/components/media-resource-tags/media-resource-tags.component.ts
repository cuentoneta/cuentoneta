import { Component, input } from '@angular/core';

import { Media, MediaTypeKey } from '@models/media.model';
import { MediaResourcePlatform, MediaResourceTagComponent } from '../media-resource-tag/media-resource-tag.component';
import { provideIcons } from '@ng-icons/core';
import { faSolidFileAudio, faSolidMicrophoneLines } from '@ng-icons/font-awesome/solid';
import { faBrandYoutube } from '@ng-icons/font-awesome/brands';

@Component({
	selector: 'cuentoneta-media-resource-tags',
	imports: [MediaResourceTagComponent],
	providers: [provideIcons({ faSolidFileAudio, faSolidMicrophoneLines, faBrandYoutube })],
	template: ` @for (mediaResource of resources(); track $index) {
		<cuentoneta-media-resource-tag [platform]="platforms[mediaResource.type]" />
	}`,
})
export class MediaResourceTagsComponent {
	readonly resources = input<Media[]>([]);
	readonly size = input<'md' | 'lg'>('md');

	platforms: { [key in MediaTypeKey]: MediaResourcePlatform } = {
		audioRecording: {
			title: 'Contiene narraciones en audio',
			icon: 'faSolidFileAudio',
		},
		spaceRecording: {
			title: 'Contiene grabaciones de Spaces de X',
			icon: 'faSolidMicrophoneLines',
		},
		youTubeVideo: {
			title: 'Contiene videos de YouTube',
			icon: 'faBrandYoutube',
		},
	};
}
