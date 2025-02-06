import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';
import { ShareButtonComponent } from '../share-button/share-button.component';
import { FacebookPlatform, SharingPlatform, TwitterPlatform, WhatsappPlatform } from '@models/sharing-platform';

@Component({
	selector: 'cuentoneta-share-content',
	imports: [CommonModule, NgxSkeletonLoaderModule, ShareButtonComponent],
	providers: [ThemeService],
	template: `
		<section class="flex flex-1 flex-row gap-6">
			@for (platform of platforms; track $index) {
				@if (!isLoading()) {
					<cuentoneta-share-button [platform]="platform" [params]="params()" [message]="message()" [route]="route()" />
				} @else {
					<ngx-skeleton-loader
						[theme]="{
							'height.px': 48,
							'width.px': 48,
							'margin.px': 0,
							'background-color': skeletonColor
						}"
						count="1"
						appearance="circle"
					/>
				}
			}
		</section>
	`,
})
export class ShareContentComponent {
	route = input<string>('');
	params = input<{ [key: string]: string }>({});
	message = input<string>('');
	isLoading = input<boolean>(false);

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

	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
}
