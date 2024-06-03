import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media } from '@models/media.model';

@Component({
	selector: 'cuentoneta-media-resource-tags',
	standalone: true,
	imports: [CommonModule],
	template: ` @for (mediaResource of resources(); track $index) {
		@switch (mediaResource.type) {
			@case ('audioRecording') {
				<div [title]="'Contiene narraciones en audio'" class="h-6 w-6">
					<img [alt]="'Contiene narraciones en audio'" src="assets/svg/waveform.svg" />
				</div>
			}
			@case ('spaceRecording') {
				<div [title]="'Contiene grabaciones de Spaces de X'" class="h-6 w-6">
					<img [alt]="'Contiene grabaciones de Spaces de X'" src="assets/svg/twitter.svg" />
				</div>
			}
			@case ('youTubeVideo') {
				<div [title]="'Contiene videos de YouTube'" class="h-6 w-6">
					<img [alt]="'Contiene videos de YouTube'" class="video" src="assets/svg/video.svg" />
				</div>
			}
		}
	}`,
})
export class MediaResourceTagsComponent {
	resources = input<Media[]>([]);
}
