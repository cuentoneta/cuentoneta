import { Directive, effect, inject } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { environment } from '../../environments/environment';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { SchemaOrgService } from '../../providers/schema-org.service';
import { AUTHOR_SEO_HOST } from './author-seo-host';
import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

@Directive({
	selector: '[cuentonetaAuthorSeo]',
	hostDirectives: [MetaTagsDirective],
})
export class AuthorSeoDirective {
	private readonly host = inject(AUTHOR_SEO_HOST);
	private readonly meta = inject(MetaTagsDirective);
	private readonly schemaOrg = inject(SchemaOrgService);

	private readonly applySeo = effect((onCleanup) => {
		const author = this.host.author();
		if (!author) {
			return;
		}
		this.meta.setTitle(author.name);
		this.meta.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
		this.meta.setCanonicalUrl(`${environment.website}/${AppRoutes.Author}/${author.slug}`);
		this.meta.setRobots('index, follow');
		this.meta.setKeywords(['escritor', 'poemas', 'cuentos', 'autor', author.name.toLowerCase()]);
		this.schemaOrg.setJsonLd('profile-page', buildAuthorProfilePageSchema(author, environment.website));
		this.schemaOrg.setJsonLd('breadcrumb-author', buildAuthorBreadcrumb(author, environment.website));
		onCleanup(() => {
			this.schemaOrg.removeJsonLd('profile-page');
			this.schemaOrg.removeJsonLd('breadcrumb-author');
		});
	});
}
