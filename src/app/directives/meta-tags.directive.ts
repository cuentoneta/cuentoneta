import { Directive, inject, PLATFORM_ID, DOCUMENT, OnDestroy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Directive({
	selector: '[cuentonetaMetaTags]',
	standalone: true,
})
export class MetaTagsDirective implements OnDestroy {
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

	setKeywords(keywords: string | string[]) {
		const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
		this.metaTagService.updateTag({
			name: 'keywords',
			content: keywordsString,
		});
	}

	removeKeywords() {
		this.metaTagService.removeTag('name="keywords"');
	}

	setDefault() {
		this.setTitle('La Cuentoneta', false);
		this.setDefaultDescription();
		this.setDefaultKeywords();
	}

	setDefaultDescription() {
		this.setDescription('Una iniciativa que busca fomentar y hacer accesible la lectura digital.');
	}

	setDefaultKeywords() {
		this.setKeywords(['cuentos', 'literatura', 'poemas', 'podcast', 'narraciones']);
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

	setRobots(content: 'index, follow' | 'noindex, nofollow' | 'index, nofollow' | 'noindex, follow' | 'all' | 'none') {
		this.metaTagService.updateTag({
			name: 'robots',
			content: content,
		});
	}

	removeRobots() {
		this.metaTagService.removeTag('name="robots"');
	}

	setImage(imageUrl: string) {
		this.metaTagService.updateTag({
			property: 'og:image',
			content: imageUrl,
		});
		this.metaTagService.updateTag({
			property: 'og:image:width',
			content: '1200',
		});
		this.metaTagService.updateTag({
			property: 'og:image:height',
			content: '630',
		});
		this.metaTagService.updateTag({
			name: 'twitter:card',
			content: 'summary_large_image',
		});
		this.metaTagService.updateTag({
			name: 'twitter:image',
			content: imageUrl,
		});
	}

	setType(type: 'website' | 'article' | 'profile') {
		this.metaTagService.updateTag({
			property: 'og:type',
			content: type,
		});
	}

	setUrl(url: string) {
		this.metaTagService.updateTag({
			property: 'og:url',
			content: url,
		});
	}

	removeImage() {
		this.metaTagService.removeTag('property="og:image"');
		this.metaTagService.removeTag('property="og:image:width"');
		this.metaTagService.removeTag('property="og:image:height"');
		this.metaTagService.removeTag('name="twitter:card"');
		this.metaTagService.removeTag('name="twitter:image"');
	}

	removeType() {
		this.metaTagService.removeTag('property="og:type"');
	}

	removeUrl() {
		this.metaTagService.removeTag('property="og:url"');
	}

	ngOnDestroy() {
		this.removeKeywords();
		this.removeCanonicalUrl();
		this.removeRobots();
		this.removeImage();
		this.removeType();
		this.removeUrl();
	}
}
