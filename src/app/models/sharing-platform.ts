import { environment } from '../environments/environment';

export interface SharingPlatform {
	name: string;
	icon: string;
	platformApiUrl: string;
	target?: string;
	features?: string;
	generateSharingUrl(appRoute: string, urlParams: string, message?: string): string;
}

export class FacebookPlatform implements SharingPlatform {
	name = 'Facebook';
	icon = 'faBrandFacebook';
	platformApiUrl = `https://www.facebook.com/share.php`;
	target = 'facebook-share-dialog';
	features = 'width=626,height=436';

	generateSharingUrl(appRoute: string, urlParams: string): string {
		const url = encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`);
		return `${this.platformApiUrl}?u=${url}`;
	}
}

export class WhatsappPlatform implements SharingPlatform {
	name = 'Whatsapp';
	icon = 'faBrandWhatsapp';
	platformApiUrl = `whatsapp://send/`;
	target = '_blank';
	features = '';

	generateSharingUrl(appRoute: string, urlParams: string, message: string): string {
		const sharedUrl = encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`);
		const queryParams: { [key: string]: string } = {
			text: `${message}%0a%0a${sharedUrl}`,
		};

		const serializedApiQueryParams = Object.keys(queryParams).map((key) => `${key}=${queryParams[key]}`);
		return `${this.platformApiUrl}?${serializedApiQueryParams.join('&')}`;
	}
}

export class TwitterPlatform implements SharingPlatform {
	name = 'Twitter';
	icon = 'faBrandXTwitter';
	platformApiUrl = `https://twitter.com/intent/tweet`;
	target = '_blank';
	features = '';

	generateSharingUrl(appRoute: string, urlParams: string, message: string): string {
		const queryParams: { [key: string]: string } = {
			url: encodeURIComponent(`${environment.website}${appRoute}?${urlParams}`),
			text: message + '%0a%0a',
		};

		const serializedApiQueryParams = Object.keys(queryParams).map((key) => `${key}=${queryParams[key]}`);
		return `${this.platformApiUrl}?${serializedApiQueryParams.join('&')}`;
	}
}
