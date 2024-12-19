import { Component, inject, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { environment } from '../../environments/environment';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-share-content',
	imports: [CommonModule, NgOptimizedImage, NgxSkeletonLoaderModule],
	providers: [ThemeService],
	templateUrl: './share-content.component.html',
	styles: `
		section {
			button {
				&:not(:last-child) {
					@apply mr-6;
				}
			}

			ngx-skeleton-loader {
				div {
					@apply m-0;
				}
				&:not(:last-child) {
					@apply mr-6;
				}
			}
		}
	`,
})
export class ShareContentComponent {
	@Input() route: string = '';
	@Input() params: { [key: string]: string } = {};
	@Input() message: string = '';
	@Input() isLoading: boolean = false;

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

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);

	onShareToPlatformClicked(event: MouseEvent | KeyboardEvent, platform: SharingPlatform) {
		const urlParams = Object.keys(this.params)
			.map((key) => `${key}=${this.params[key]}`)
			.join('&');
		window.open(platform.generateSharingUrl(this.route, urlParams, this.message), platform.target, platform.features);
	}
}

interface SharingPlatform {
	name: string;
	logo: string;
	platformApiUrl: string;
	target?: string;
	features?: string;
	generateSharingUrl(appRoute: string, urlParams: string, message?: string): string;
}

class FacebookPlatform implements SharingPlatform {
	name = 'Facebook';
	logo = 'facebook';
	platformApiUrl = `https://www.facebook.com/share.php`;
	target = 'facebook-share-dialog';
	features = 'width=626,height=436';

	generateSharingUrl(appRoute: string, urlParams: string): string {
		const url = encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`);
		return `${this.platformApiUrl}?u=${url}`;
	}
}

class WhatsappPlatform implements SharingPlatform {
	name = 'Whatsapp';
	logo = 'whatsapp';
	platformApiUrl = `whatsapp://send/`;
	target = '_blank';
	features = '';

	generateSharingUrl(appRoute: string, urlParams: string, message: string): string {
		const sharedUrl = encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`);
		const queryParams: { [key: string]: string } = {
			text: `${message}%0a%0a${sharedUrl}`,
		};

		const serializedApiQueryParams = Object.keys(queryParams).map((key) => `${key}=${queryParams[key]}`);
		const navigationUrl = `${this.platformApiUrl}?${serializedApiQueryParams.join('&')}`;
		return navigationUrl;
	}
}

class TwitterPlatform implements SharingPlatform {
	name = 'Twitter';
	logo = 'twitter';
	platformApiUrl = `https://twitter.com/intent/tweet`;
	target = '_blank';
	features = '';

	generateSharingUrl(appRoute: string, urlParams: string, message: string): string {
		const queryParams: { [key: string]: string } = {
			url: encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`),
			text: message + '%0a%0a',
		};

		const serializedApiQueryParams = Object.keys(queryParams).map((key) => `${key}=${queryParams[key]}`);
		const navigationUrl = `${this.platformApiUrl}?${serializedApiQueryParams.join('&')}`;
		return navigationUrl;
	}
}
