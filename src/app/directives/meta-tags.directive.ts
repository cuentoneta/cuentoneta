import { Directive, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Directive({
	selector: '[cuentonetaMetaTags]',
	standalone: true,
})
export class MetaTagsDirective {
	private metaTagService = inject(Meta);
	private platformId = inject(PLATFORM_ID);
	private titleService = inject(Title);

	setTitle(title: string) {
		const platformTitle = isPlatformBrowser(this.platformId) ? `${title} | La Cuentoneta` : title;
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
}
