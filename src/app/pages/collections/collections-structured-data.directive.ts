import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredData } from '../../directives/abstract-structured-data.directive';
import { COLLECTIONS_HOST } from './collections-host';
import { buildCollectionCatalogBreadcrumb, buildCollectionCatalogSchema } from './collections.schema';

@Directive({
	selector: '[cuentonetaCollectionsStructuredData]',
})
export class CollectionsStructuredData extends AbstractStructuredData {
	private readonly host = inject(COLLECTIONS_HOST);

	private readonly pageSchemaId = 'collection-catalog';
	private readonly breadcrumbSchemaId = 'breadcrumb-collection-catalog';

	protected applyStructuredData(): void {
		const collections = this.host.collections();
		untracked(() => {
			// Siempre: "Inicio → Colecciones" es verdad haya o no elementos en el catálogo.
			this.schemaOrg.setPageScopedJsonLd(
				this.breadcrumbSchemaId,
				buildCollectionCatalogBreadcrumb(environment.website),
			);
			// Un `ItemList` vacío afirma que el sitio no tiene colecciones; no emitir nada no afirma nada.
			if (collections.length === 0) {
				return;
			}
			this.schemaOrg.setPageScopedJsonLd(
				this.pageSchemaId,
				buildCollectionCatalogSchema(collections, environment.website),
			);
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd(this.pageSchemaId);
		this.schemaOrg.removeJsonLd(this.breadcrumbSchemaId);
	}
}
