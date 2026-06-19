import { Directive, effect, inject } from '@angular/core';

import { SchemaOrgService } from '../providers/schema-org.service';

@Directive()
export abstract class AbstractStructuredDataDirective {
	protected readonly schemaOrg = inject(SchemaOrgService);

	// eslint-disable-next-line @typescript-eslint/no-empty-function -- stub opcional: las páginas sin bloques propios (p. ej. home) no agregan structured data
	protected applyStructuredData(): void {}
	protected abstract removeStructuredData(): void;

	private readonly structuredDataEffect = effect((onCleanup) => {
		this.applyStructuredData();
		onCleanup(() => this.removeStructuredData());
	});
}
