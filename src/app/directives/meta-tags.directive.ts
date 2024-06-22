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
}
