import { Component, input } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ShareButtonComponent } from '../share-button/share-button.component';
import { FacebookPlatform, SharingPlatform, TwitterPlatform, WhatsappPlatform } from '@models/sharing-platform';

@Component({
	selector: 'cuentoneta-share-content',
	imports: [NgxSkeletonLoaderModule, ShareButtonComponent],
	template: `
		<section class="flex flex-1 flex-row gap-6">
			@for (platform of platforms; track $index) {
				<cuentoneta-share-button [platform]="platform" [params]="params()" [message]="message()" [route]="route()" />
			}
		</section>
	`,
	styles: `
		:host ::ng-deep .share-button-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
})
export class ShareContentComponent {
	readonly route = input<string>('');
	readonly params = input<{ [key: string]: string }>({});
	readonly message = input<string>('');

	platforms: SharingPlatform[] = [
		new FacebookPlatform(),
		new WhatsappPlatform(),
		new TwitterPlatform(),
		// {
		//   name: 'Instagram',
		//   logo: 'instagram',
		//   url: 'https://instagram.com',
		// },
		// {
		//   name: 'Copiar Hipervínculo al Portapapeles',
		//   logo: 'copy-link',
		//   url: 'copy',
		// },
	];
}
