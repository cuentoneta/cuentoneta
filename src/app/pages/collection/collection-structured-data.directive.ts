import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { COLLECTION_HOST } from './collection-host';
import { buildCollectionBreadcrumb, buildCollectionPageSchema } from './collection.schema';

@Directive({
	selector: '[cuentonetaCollectionStructuredData]',
})
export class CollectionStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(COLLECTION_HOST);

	private readonly pageSchemaId = 'collection';
	private readonly breadcrumbSchemaId = 'breadcrumb-collection';

	protected applyStructuredData(): void {
		const collection = this.host.collection();
		if (!collection) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd(this.pageSchemaId, buildCollectionPageSchema(collection, environment.website));
			this.schemaOrg.setPageScopedJsonLd(
				this.breadcrumbSchemaId,
				buildCollectionBreadcrumb(collection, environment.website),
			);
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd(this.pageSchemaId);
		this.schemaOrg.removeJsonLd(this.breadcrumbSchemaId);
	}
}
