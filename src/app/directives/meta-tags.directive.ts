import { Directive, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Directive({
	selector: '[cuentonetaMetaTags]',
	standalone: true,
})
export class MetaTagsDirective {
	private document = inject(DOCUMENT);
	private metaTagService = inject(Meta);
	private platformId = inject(PLATFORM_ID);
	private titleService = inject(Title);

	setTitle(title: string, addPrefix: boolean = true) {
		const platformTitle = isPlatformBrowser(this.platformId) && addPrefix ? `${title} | La Cuentoneta` : title;
		this.titleService.setTitle(`${platformTitle}`);
		this.metaTagService.updateTag({
			name: 'twitter:title',
			content: title,
		});

		this.metaTagService.updateTag({
			property: 'og:title',
			content: title,
		});
	}

	setDescription(content: string) {
		this.metaTagService.updateTag({
			name: 'description',
			content: content,
		});
		this.metaTagService.updateTag({
			name: 'twitter:description',
			content: content,
		});
		this.metaTagService.updateTag({
			property: 'og:description',
			content: content,
		});
	}

	setDefault() {
		this.setTitle('La Cuentoneta', false);
		this.setDefaultDescription();
	}

	setDefaultDescription() {
		this.setDescription('Una iniciativa que busca fomentar y hacer accesible la lectura digital.');
	}

	setCanonicalUrl(url: string) {
		const head = this.document.getElementsByTagName('head')[0];
		let element: HTMLLinkElement | null = this.document.querySelector(`link[rel='canonical']`) || null;
		if (!element) {
			element = this.document.createElement('link') as HTMLLinkElement;
			head.appendChild(element);
		}
		element.setAttribute('rel', 'canonical');
		element.setAttribute('href', url);
	}

	removeCanonicalUrl() {
		const element = this.document.querySelector(`link[rel='canonical']`);
		if (element) {
			element.remove();
		}
	}
}
