import { Directive, effect, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
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

	private readonly resetTagsOnDestroy = effect((onCleanup) => {
		onCleanup(() => {
			this.removeKeywords();
			this.removeCanonicalUrl();
			this.removeRobots();
			this.removeAuthor();
			this.removeArticleDates();
		});
	});

	public setTitle(title: string, addPrefix: boolean = true) {
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

	public setDescription(content: string) {
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

	public setKeywords(keywords: string | string[]) {
		const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
		this.metaTagService.updateTag({
			name: 'keywords',
			content: keywordsString,
		});
	}

	public removeKeywords() {
		this.metaTagService.removeTag('name="keywords"');
	}

	setAuthor(name: string) {
		this.metaTagService.updateTag({
			name: 'author',
			content: name,
		});
	}

	removeAuthor() {
		this.metaTagService.removeTag('name="author"');
	}

	// Señales E-E-A-T para contenido de tipo artículo (cuentos): fecha de publicación y de
	// modificación en formato ISO, vía las propiedades og/article.
	setArticleDates(publishedTime: string, modifiedTime: string) {
		this.metaTagService.updateTag({
			property: 'article:published_time',
			content: publishedTime,
		});
		this.metaTagService.updateTag({
			property: 'article:modified_time',
			content: modifiedTime,
		});
	}

	removeArticleDates() {
		this.metaTagService.removeTag('property="article:published_time"');
		this.metaTagService.removeTag('property="article:modified_time"');
	}

	public setDefault() {
		this.setTitle('La Cuentoneta', false);
		this.setDefaultDescription();
		this.setDefaultKeywords();
	}

	public setDefaultDescription() {
		this.setDescription('Una iniciativa que busca fomentar y hacer accesible la lectura digital.');
	}

	public setDefaultKeywords() {
		this.setKeywords(['cuentos', 'literatura', 'poemas', 'podcast', 'narraciones']);
	}

	public setCanonicalUrl(url: string) {
		const head = this.document.getElementsByTagName('head')[0];
		let element: HTMLLinkElement | null = this.document.querySelector(`link[rel='canonical']`) || null;
		if (!element) {
			element = this.document.createElement('link') as HTMLLinkElement;
			head.appendChild(element);
		}
		element.setAttribute('rel', 'canonical');
		element.setAttribute('href', url);
	}

	public removeCanonicalUrl() {
		const element = this.document.querySelector(`link[rel='canonical']`);
		if (element) {
			element.remove();
		}
	}

	// Para páginas indexables emitimos, además de index/follow, las directivas de vista previa
	// enriquecida (imagen grande, snippet y video sin límite) para mejorar la aparición en
	// buscadores y answer engines. Coincide con el fallback estático de indexFile.html.
	private readonly indexableRobots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

	public setRobots(
		content: 'index, follow' | 'noindex, nofollow' | 'index, nofollow' | 'noindex, follow' | 'all' | 'none',
	) {
		const value = content === 'index, follow' || content === 'all' ? this.indexableRobots : content;
		this.metaTagService.updateTag({
			name: 'robots',
			content: value,
		});
	}

	public removeRobots() {
		this.metaTagService.removeTag('name="robots"');
	}
}
