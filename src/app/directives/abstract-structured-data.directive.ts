import { Directive, effect, inject } from '@angular/core';

import { SchemaOrgService } from '../providers/schema-org.service';

@Directive()
export abstract class AbstractStructuredDataDirective {
	protected readonly schemaOrg = inject(SchemaOrgService);

	protected abstract applyStructuredData(): void;
	// Abstracto a propósito: ninguna página puede aplicar JSON-LD sin definir cómo removerlo al salir.
	protected abstract removeStructuredData(): void;

	private readonly structuredDataEffect = effect((onCleanup) => {
		this.applyStructuredData();
		onCleanup(() => this.removeStructuredData());
	});
}
