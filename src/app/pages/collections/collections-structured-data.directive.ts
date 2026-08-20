import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { COLLECTIONS_HOST } from './collections-host';
import { buildCollectionCatalogBreadcrumb, buildCollectionCatalogSchema } from './collections.schema';

@Directive({
	selector: '[cuentonetaCollectionsStructuredData]',
})
export class CollectionsStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(COLLECTIONS_HOST);

	private readonly pageSchemaId = 'collection-catalog';
	private readonly breadcrumbSchemaId = 'breadcrumb-collection-catalog';

	protected applyStructuredData(): void {
		const collections = this.host.collections();
		// Un `ItemList` de cero ítems describe un catálogo vacío, que es peor que no describir nada.
		if (collections.length === 0) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd(
				this.pageSchemaId,
				buildCollectionCatalogSchema(collections, environment.website),
			);
			this.schemaOrg.setPageScopedJsonLd(
				this.breadcrumbSchemaId,
				buildCollectionCatalogBreadcrumb(environment.website),
			);
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd(this.pageSchemaId);
		this.schemaOrg.removeJsonLd(this.breadcrumbSchemaId);
	}
}
