import { Directive, inject, TemplateRef } from '@angular/core';

/** Marca el `<ng-template>` a proyectar como encabezado del drawer: `<ng-template cuentonetaDrawerHeader>…</ng-template>`. */
@Directive({ selector: '[cuentonetaDrawerHeader]' })
export class DrawerHeader {
	public readonly templateRef = inject(TemplateRef);
}
