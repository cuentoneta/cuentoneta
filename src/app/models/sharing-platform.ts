import { environment } from '../environments/environment';
import { faBrandFacebook, faBrandWhatsapp, faBrandXTwitter } from '@ng-icons/font-awesome/brands';

export interface SharingPlatform {
	name: string;
	icon: Record<string, string>;
	platformApiUrl: string;
	target?: string;
	features?: string;
	generateSharingUrl(appRoute: string, urlParams: string, message?: string): string;
}

export class FacebookPlatform implements SharingPlatform {
	public name = 'Facebook';
	public icon = { faBrandFacebook };
	public platformApiUrl = `https://www.facebook.com/share.php`;
	public target = 'facebook-share-dialog';
	public features = 'width=626,height=436';

	public generateSharingUrl(appRoute: string, urlParams: string): string {
		const url = encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`);
		return `${this.platformApiUrl}?u=${url}`;
	}
}

export class WhatsappPlatform implements SharingPlatform {
	public name = 'Whatsapp';
	public icon = { faBrandWhatsapp };
	public platformApiUrl = `whatsapp://send/`;
	public target = '_blank';
	public features = '';

	public generateSharingUrl(appRoute: string, urlParams: string, message: string): string {
		const sharedUrl = encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`);
		const queryParams: { [key: string]: string } = {
			text: `${message}%0a%0a${sharedUrl}`,
		};

		const serializedApiQueryParams = Object.keys(queryParams).map((key) => `${key}=${queryParams[key]}`);
		return `${this.platformApiUrl}?${serializedApiQueryParams.join('&')}`;
	}
}

export class TwitterPlatform implements SharingPlatform {
	public name = 'Twitter';
	public icon = { faBrandXTwitter };
	public platformApiUrl = `https://twitter.com/intent/tweet`;
	public target = '_blank';
	public features = '';

	public generateSharingUrl(appRoute: string, urlParams: string, message: string): string {
		const queryParams: { [key: string]: string } = {
			url: encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`),
			text: message + '%0a%0a',
		};

		const serializedApiQueryParams = Object.keys(queryParams).map((key) => `${key}=${queryParams[key]}`);
		return `${this.platformApiUrl}?${serializedApiQueryParams.join('&')}`;
	}
}
