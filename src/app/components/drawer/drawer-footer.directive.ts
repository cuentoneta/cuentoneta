import { Directive, inject, TemplateRef } from '@angular/core';

/** Marca el `<ng-template>` a proyectar como pie del drawer: `<ng-template cuentonetaDrawerFooter>…</ng-template>`. */
@Directive({ selector: '[cuentonetaDrawerFooter]' })
export class DrawerFooterDirective {
	public readonly templateRef = inject(TemplateRef);
}
