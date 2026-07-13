import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { ShareButtonComponent } from '../share-button/share-button.component';
import { FacebookPlatform, SharingPlatform, TwitterPlatform, WhatsappPlatform } from '@models/sharing-platform';

@Component({
	selector: 'cuentoneta-share-content',
	imports: [ShareButtonComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<section class="flex flex-1 flex-row gap-6">
			@for (platform of platforms; track $index) {
				<cuentoneta-share-button [platform]="platform" [params]="params()" [message]="message()" [route]="route()" />
			}
		</section>
	`,
})
export class ShareContentComponent {
	public readonly route = input<string>('');
	public readonly params = input<{ [key: string]: string }>({});
	public readonly message = input<string>('');

	protected platforms: SharingPlatform[] = [
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
