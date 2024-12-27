import { Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Media } from '@models/media.model';

@Component({
	selector: 'cuentoneta-media-resource-tags',
	imports: [CommonModule, NgOptimizedImage],
	template: ` @for (mediaResource of resources(); track $index) {
		@switch (mediaResource.type) {
			@case ('audioRecording') {
				<div [title]="'Contiene narraciones en audio'" [class]="size()" class="flex items-center justify-center">
					<img [alt]="'Contiene narraciones en audio'" [ngSrc]="'assets/svg/waveform.svg'" width="24" height="24" />
				</div>
			}
			@case ('spaceRecording') {
				<div [title]="'Contiene grabaciones de Spaces de X'" [class]="size()" class="flex items-center justify-center">
					<img
						[alt]="'Contiene grabaciones de Spaces de X'"
						[ngSrc]="'assets/svg/twitter.svg'"
						width="24"
						height="24"
					/>
				</div>
			}
			@case ('youTubeVideo') {
				<div [title]="'Contiene videos de YouTube'" [class]="size()" class="flex items-center justify-center">
					<img [alt]="'Contiene videos de YouTube'" [ngSrc]="'assets/svg/video.svg'" width="24" height="24" />
				</div>
			}
		}
	}`,
	styles: `
		.md {
			@apply h-6 w-6;
		}

		.lg {
			@apply h-8 w-8;
		}
	`,
})
export class MediaResourceTagsComponent {
	resources = input<Media[]>([]);
	size = input<'md' | 'lg'>('md');
}
