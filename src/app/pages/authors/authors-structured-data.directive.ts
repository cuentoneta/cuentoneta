import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { AUTHORS_HOST } from './authors-host';
import { buildAuthorCatalogBreadcrumb, buildAuthorCatalogSchema } from './authors.schema';

@Directive({
	selector: '[cuentonetaAuthorsStructuredData]',
})
export class AuthorsStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(AUTHORS_HOST);

	private readonly pageSchemaId = 'author-catalog';
	private readonly breadcrumbSchemaId = 'breadcrumb-author-catalog';

	protected applyStructuredData(): void {
		const authors = this.host.authors();
		// Un `ItemList` vacío afirma que el sitio no tiene autores; no emitir nada no afirma nada.
		if (authors.length === 0) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd(this.pageSchemaId, buildAuthorCatalogSchema(authors, environment.website));
			this.schemaOrg.setPageScopedJsonLd(this.breadcrumbSchemaId, buildAuthorCatalogBreadcrumb(environment.website));
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd(this.pageSchemaId);
		this.schemaOrg.removeJsonLd(this.breadcrumbSchemaId);
	}
}
