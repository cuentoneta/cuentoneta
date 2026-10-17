import { Directive, effect, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { applyDefaultOgImage } from '../providers/default-og-image.initializer';

@Directive({
	selector: '[cuentonetaHeadMetadata]',
	standalone: true,
})
export class HeadMetadata {
	private readonly document = inject(DOCUMENT);
	private readonly metaTagService = inject(Meta);
	private readonly platformId = inject(PLATFORM_ID);
	private readonly titleService = inject(Title);

	private readonly resetTagsOnDestroy = effect((onCleanup) => {
		onCleanup(() => {
			this.removeTitle();
			this.removeDescription();
			this.removeKeywords();
			this.removeCanonicalUrl();
			this.removeRobots();
			this.removeAuthor();
			this.removeArticleDates();
			this.removeImage();
		});
	});

	public setTitle(title: string) {
		const documentTitle = isPlatformBrowser(this.platformId) ? `${title} | La Cuentoneta` : title;
		this.setTitleTags(documentTitle, title);
	}

	// Para títulos que ya incluyen la marca (p. ej. la home), sin agregar el sufijo "| La Cuentoneta".
	public setExactTitle(title: string) {
		this.setTitleTags(title, title);
	}

	private setTitleTags(documentTitle: string, socialTitle: string) {
		this.titleService.setTitle(documentTitle);
		this.metaTagService.updateTag({ name: 'twitter:title', content: socialTitle });
		this.metaTagService.updateTag({ property: 'og:title', content: socialTitle });
	}

	public removeTitle() {
		this.titleService.setTitle('');
		this.metaTagService.removeTag('name="twitter:title"');
		this.metaTagService.removeTag('property="og:title"');
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

	public removeDescription() {
		this.metaTagService.removeTag('name="description"');
		this.metaTagService.removeTag('name="twitter:description"');
		this.metaTagService.removeTag('property="og:description"');
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

	public setAuthor(name: string) {
		this.metaTagService.updateTag({
			name: 'author',
			content: name,
		});
	}

	public removeAuthor() {
		this.metaTagService.removeTag('name="author"');
	}

	// Fecha de publicación y de última modificación (ISO) vía las propiedades og/article. Son señales
	// E-E-A-T aplicables a cualquier entidad modelada como artículo —una obra, la ficha de un autor
	// (cuándo se creó o se actualizó)—, no solo a las obras.
	public setArticleDates(publishedTime: string, modifiedTime: string) {
		this.metaTagService.updateTag({
			property: 'article:published_time',
			content: publishedTime,
		});
		this.metaTagService.updateTag({
			property: 'article:modified_time',
			content: modifiedTime,
		});
	}

	public removeArticleDates() {
		this.metaTagService.removeTag('property="article:published_time"');
		this.metaTagService.removeTag('property="article:modified_time"');
	}

	public setDefault() {
		this.setExactTitle('La Cuentoneta');
		this.setDefaultDescription();
		this.setDefaultKeywords();
	}

	public setDefaultDescription() {
		this.setDescription('Una iniciativa que busca fomentar y hacer accesible la lectura digital.');
	}

	public setDefaultKeywords() {
		this.setKeywords(['cuentos', 'literatura', 'poemas', 'podcast', 'narraciones']);
	}

	// El fallback de og:url es el home. A diferencia del <link rel="canonical"> —que se elimina al
	// limpiar— og:url se resetea al home para que una página sin canonical propio no arrastre el og:url
	// de la anterior en la navegación SPA (mismo patrón que og:image con su logo por defecto).
	private readonly defaultOgUrl = environment.website;

	public setCanonicalUrl(url: string) {
		const head = this.document.getElementsByTagName('head')[0];
		let element: HTMLLinkElement | null = this.document.querySelector(`link[rel='canonical']`) || null;
		if (!element) {
			element = this.document.createElement('link') as HTMLLinkElement;
			head.appendChild(element);
		}
		element.setAttribute('rel', 'canonical');
		element.setAttribute('href', url);
		this.metaTagService.updateTag({ property: 'og:url', content: url });
	}

	public removeCanonicalUrl() {
		const element = this.document.querySelector(`link[rel='canonical']`);
		if (element) {
			element.remove();
		}
		this.metaTagService.updateTag({ property: 'og:url', content: this.defaultOgUrl });
	}

	// Para páginas indexables emitimos, además de index/follow, las directivas de vista previa
	// enriquecida (imagen grande, snippet y video sin límite) para mejorar la aparición en
	// buscadores y answer engines. Coincide con el fallback estático de indexFile.html.
	private readonly indexableRobots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

	public setRobots(
		content: 'index, follow' | 'noindex, nofollow' | 'index, nofollow' | 'noindex, follow' | 'all' | 'none',
	) {
		// Builds no indexables (staging/previews) van noindex sin importar el argumento: alinea el <meta>
		// con el header X-Robots-Tag del server y blinda esos entornos frente a páginas futuras.
		if (!environment.indexable) {
			this.metaTagService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
			return;
		}
		const value = content === 'index, follow' || content === 'all' ? this.indexableRobots : content;
		this.metaTagService.updateTag({
			name: 'robots',
			content: value,
		});
	}

	public removeRobots() {
		this.metaTagService.removeTag('name="robots"');
	}

	// A diferencia del resto de los tags —que se eliminan al limpiar— la imagen se resetea para que una
	// página sin imagen dedicada siga exponiendo un og:image/twitter:image válido. El de og:image es el
	// mismo que declara el initializer al bootstrap; el de twitter:image coincide con el <meta> estático de
	// indexFile.html y conserva el logo hasta que las tarjetas sociales tengan su propia imagen.
	private readonly defaultTwitterImageUrl = 'assets/svg/logo.svg';

	public setImage(url: string, alt: string, width?: number, height?: number) {
		this.metaTagService.updateTag({ property: 'og:image', content: url });
		this.metaTagService.updateTag({ property: 'og:image:alt', content: alt });
		this.setImageDimensions(width, height);
		this.metaTagService.updateTag({ name: 'twitter:image', content: url });
	}

	// La imagen representativa que leen los buscadores. Quita el alt, que describe al logo del default y
	// no a esta imagen; deja intactos las dimensiones y twitter:image.
	public setOgImage(url: string) {
		this.metaTagService.updateTag({ property: 'og:image', content: url });
		this.metaTagService.removeTag('property="og:image:alt"');
	}

	public removeImage() {
		applyDefaultOgImage(this.metaTagService);
		this.metaTagService.removeTag('property="og:image:width"');
		this.metaTagService.removeTag('property="og:image:height"');
		this.metaTagService.updateTag({ name: 'twitter:image', content: this.defaultTwitterImageUrl });
	}

	private setImageDimensions(width?: number, height?: number) {
		if (width !== undefined) {
			this.metaTagService.updateTag({ property: 'og:image:width', content: String(width) });
		} else {
			this.metaTagService.removeTag('property="og:image:width"');
		}
		if (height !== undefined) {
			this.metaTagService.updateTag({ property: 'og:image:height', content: String(height) });
		} else {
			this.metaTagService.removeTag('property="og:image:height"');
		}
	}
}
