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
				<div [title]="'Contiene material en formato audio'" class="h-6 w-6">
					<img [alt]="'Contiene audio'" src="assets/svg/waveform.svg" />
				</div>
			}
			@case ('spaceRecording') {
				<div [title]="'Contiene material en formato Spaces de X'" class="h-6 w-6">
					<img [alt]="'Contiene link a Spaces'" src="assets/svg/twitter.svg" />
				</div>
			}
			@case ('youTubeVideo') {
				<div [title]="'Contiene material en formato video de YouTube'" class="h-6 w-6">
					<img [alt]="'Contiene video de YouTube'" class="video" src="assets/svg/video.svg" />
				</div>
			}
		}
	}`,
})
export class MediaResourceTagsComponent {
	resources = input<Media[]>([]);
}
