import { Directive } from '@angular/core';

import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';

// El JSON-LD de /read llega con el Slice 3 del epic; esta directiva satisface desde ya el combo
// obligatorio de directivas SEO de página indexable (guardrail seo-host-directives.spec.ts) sin
// emitir nada: applyStructuredData() queda en el stub heredado.
@Directive({
	selector: '[cuentonetaReadStructuredData]',
})
export class ReadStructuredDataDirective extends AbstractStructuredDataDirective {
	// eslint-disable-next-line @typescript-eslint/no-empty-function -- sin bloques propios todavía: nada que remover
	protected removeStructuredData(): void {}
}
