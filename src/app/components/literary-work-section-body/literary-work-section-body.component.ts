import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { SanitizedHtml } from '@models/sanitized-html.model';

/**
 * Pinta el cuerpo de una sección de obra —el campo `body` del CMS, ya saneado por el pipeline del ACL—
 * con la tipografía de lectura. Sirve a cualquier género: el schema no distingue verso de prosa.
 *
 * Existe para que ese HTML tenga un dueño: el `bypassSecurityTrustHtml` vive acá y no repartido por
 * las páginas que lo consumen, y las reglas tipográficas de los nodos que el pipeline emite —que no
 * llevan clases y por eso ninguna utilidad alcanza— se anclan a este selector de elemento, así que
 * viajan con el componente en vez de con una ruta.
 */
@Component({
	selector: 'cuentoneta-literary-work-section-body',
	template: `<div [innerHTML]="safeBody()"></div>`,
	host: {
		class: 'block source-serif-xl text-neutral-800',
		'data-testid': 'literary-work-section-body',
	},
})
export class LiteraryWorkSectionBodyComponent {
	public readonly body = input.required<SanitizedHtml>();

	private readonly sanitizer = inject(DomSanitizer);

	protected readonly safeBody = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.body()));
}
