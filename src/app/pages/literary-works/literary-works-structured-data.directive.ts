import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { LITERARY_WORKS_HOST } from './literary-works-host';
import { buildLiteraryWorkCatalogBreadcrumb, buildLiteraryWorkCatalogSchema } from './literary-works.schema';

@Directive({
	selector: '[cuentonetaLiteraryWorksStructuredData]',
})
export class LiteraryWorksStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(LITERARY_WORKS_HOST);

	private readonly pageSchemaId = 'literary-work-catalog';
	private readonly breadcrumbSchemaId = 'breadcrumb-literary-work-catalog';

	protected applyStructuredData(): void {
		const literaryWorks = this.host.literaryWorks();
		// Un `ItemList` vacío afirma que el sitio no tiene obras; no emitir nada no afirma nada.
		if (literaryWorks.length === 0) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd(
				this.pageSchemaId,
				buildLiteraryWorkCatalogSchema(literaryWorks, environment.website),
			);
			this.schemaOrg.setPageScopedJsonLd(
				this.breadcrumbSchemaId,
				buildLiteraryWorkCatalogBreadcrumb(environment.website),
			);
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd(this.pageSchemaId);
		this.schemaOrg.removeJsonLd(this.breadcrumbSchemaId);
	}
}
