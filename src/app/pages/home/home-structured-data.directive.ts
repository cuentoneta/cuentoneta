import { Directive } from '@angular/core';

import { AbstractStructuredData } from '../../directives/abstract-structured-data.directive';

@Directive({
	selector: '[cuentonetaHomeStructuredData]',
})
export class HomeStructuredData extends AbstractStructuredData {
	protected applyStructuredData(): void {
		this.schemaOrg.removePageScopedJsonLd();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function -- la home no agrega bloques propios; no hay nada que remover al salir
	protected removeStructuredData(): void {}
}
