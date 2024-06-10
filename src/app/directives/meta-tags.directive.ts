import { Directive, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Directive({
	selector: '[cuentonetaMetaTags]',
	standalone: true,
})
export class MetaTagsDirective {
	private metaTagService = inject(Meta);
	private titleService = inject(Title);

	setTitle(title: string) {
		this.titleService.setTitle(title);
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
