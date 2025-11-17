import { Component, inject, input } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';
import { ShareButtonComponent } from '../share-button/share-button.component';
import { FacebookPlatform, SharingPlatform, TwitterPlatform, WhatsappPlatform } from '@models/sharing-platform';
import { A11yTooltipModule } from '@a11y-ngx/tooltip';

@Component({
	selector: 'cuentoneta-share-content',
	imports: [NgxSkeletonLoaderModule, ShareButtonComponent, A11yTooltipModule],
	providers: [ThemeService],
	template: `
		<section class="flex flex-1 flex-row gap-6">
			@for (platform of platforms; track $index) {
				@if (!isLoading()) {
					<cuentoneta-share-button
						[platform]="platform"
						[params]="params()"
						[message]="message()"
						[route]="route()"
						[tooltip]="getShareTooltip(platform)"
						[tooltipConfig]="{ asLabel: true, useBootstrapStyles: true }"
					/>
				} @else {
					<ngx-skeleton-loader
						[theme]="{
							'height.px': 48,
							'width.px': 48,
							'margin.px': 0,
							'background-color': skeletonColor,
						}"
						data-testid="share-skeleton-loader"
						count="1"
						appearance="circle"
					/>
				}
			}
		</section>
	`,
})
export class ShareContentComponent {
	readonly route = input<string>('');
	readonly params = input<{ [key: string]: string }>({});
	readonly message = input<string>('');
	readonly isLoading = input<boolean>(false);

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

	getShareTooltip(platform: SharingPlatform): string {
		return `Compartir en ${platform.name}`;
	}
}
