import { Directive, effect, inject } from '@angular/core';

import { HeadMetadataDirective } from './head-metadata.directive';
import { SchemaOrgService } from '../providers/schema-org.service';

// Contrato común de las directivas SEO por página. Cada página implementa `applySeoTags` (y, si emite
// JSON-LD, `removeStructuredData`); la base las orquesta en un effect que aplica al entrar y limpia al salir.
@Directive()
export abstract class AbstractPageSeoDirective {
	protected readonly meta = inject(HeadMetadataDirective);
	protected readonly schemaOrg = inject(SchemaOrgService);

	protected abstract applySeoTags(): void;
	protected removeStructuredData(): void {
		// Hook opcional: las páginas que no emiten JSON-LD (p. ej. home) no lo sobrescriben.
	}

	private readonly seoEffect = effect((onCleanup) => {
		this.applySeoTags();
		onCleanup(() => this.removeStructuredData());
	});
}
