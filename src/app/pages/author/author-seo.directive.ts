import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { environment } from '../../environments/environment';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { AbstractPageSeoDirective } from '../../directives/abstract-page-seo.directive';
import { AUTHOR_SEO_HOST } from './author-seo-host';
import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

@Directive({
	selector: '[cuentonetaAuthorSeo]',
	hostDirectives: [MetaTagsDirective],
})
export class AuthorSeoDirective extends AbstractPageSeoDirective {
	private readonly host = inject(AUTHOR_SEO_HOST);

	protected applySeoTags(): void {
		const author = this.host.author();
		if (!author) {
			return;
		}
		untracked(() => {
			this.meta.setTitle(author.name);
			this.meta.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
			this.meta.setCanonicalUrl(`${environment.website}/${AppRoutes.Author}/${author.slug}`);
			this.meta.setRobots('index, follow');
			this.meta.setKeywords(['escritor', 'poemas', 'cuentos', 'autor', author.name.toLowerCase()]);
			this.schemaOrg.setJsonLd('profile-page', buildAuthorProfilePageSchema(author, environment.website));
			this.schemaOrg.setJsonLd('breadcrumb-author', buildAuthorBreadcrumb(author, environment.website));
		});
	}

	protected override removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('profile-page');
		this.schemaOrg.removeJsonLd('breadcrumb-author');
	}
}
