import { Directive } from '@angular/core';

import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';

@Directive({
	selector: '[cuentonetaHomeStructuredData]',
})
export class HomeStructuredDataDirective extends AbstractStructuredDataDirective {
	protected applyStructuredData(): void {
		this.schemaOrg.removePageScopedJsonLd();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function -- la home no inyecta bloques propios; no hay nada que remover al salir
	protected removeStructuredData(): void {}
}
