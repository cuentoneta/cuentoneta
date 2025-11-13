import { Component, computed, createEnvironmentInjector, EnvironmentInjector, inject, input } from '@angular/core';

import { Media, MediaTypeKey } from '@models/media.model';
import { MediaResourcePlatform, MediaResourceTagComponent } from '../media-resource-tag/media-resource-tag.component';
import { provideIcons } from '@ng-icons/core';
import { faSolidFileAudio, faSolidMicrophoneLines } from '@ng-icons/font-awesome/solid';
import { faBrandSpotify, faBrandYoutube } from '@ng-icons/font-awesome/brands';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-media-resource-tags',
	imports: [NgComponentOutlet],
	template: ` @for (mediaResource of parsedResources(); track $index) {
		<ng-container
			*ngComponentOutlet="
				MediaResourceTagComponent;
				inputs: { platform: platforms[mediaResource.type] };
				injector: mediaResource.injector
			"
		/>
	}`,
})
export class MediaResourceTagsComponent {
	readonly resources = input<Media[]>([]);
	readonly size = input<'md' | 'lg'>('md');
	readonly MediaResourceTagComponent = MediaResourceTagComponent;

	private injector = inject(EnvironmentInjector);

	// We use a custom injector for the nav items to load ng-icons on demand using lazy loading
	// By providing the icon definitions in navigation.config.ts we're able to directly load the icons
	// that are rendered on the sidebar
	readonly parsedResources = computed(() =>
		this.resources().map((resource) => ({
			...resource,
			injector: createEnvironmentInjector([provideIcons(this.platforms[resource.type].icon)], this.injector),
		})),
	);

	readonly platforms: { [key in MediaTypeKey]: MediaResourcePlatform } = {
		audioRecording: {
			title: 'Contiene narraciones en audio',
			icon: { faSolidFileAudio },
		},
		spaceRecording: {
			title: 'Contiene grabaciones de Spaces de X',
			icon: { faSolidMicrophoneLines },
		},
		spotifyAudio: {
			title: 'Contiene podcasts de Spotify',
			icon: { faBrandSpotify },
		},
		youTubeVideo: {
			title: 'Contiene videos de YouTube',
			icon: { faBrandYoutube },
		},
	};
}
