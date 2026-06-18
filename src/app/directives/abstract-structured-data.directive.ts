import { Directive, effect, inject } from '@angular/core';

import { SchemaOrgService } from '../providers/schema-org.service';

@Directive()
export abstract class AbstractStructuredDataDirective {
	protected readonly schemaOrg = inject(SchemaOrgService);

	protected abstract applyStructuredData(): void;
	protected abstract removeStructuredData(): void;

	private readonly structuredDataEffect = effect((onCleanup) => {
		this.applyStructuredData();
		onCleanup(() => this.removeStructuredData());
	});
}
