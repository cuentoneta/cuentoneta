import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { SanitizedHtml } from '@models/sanitized-html.model';

/**
 * Pinta el cuerpo de una obra, que llega como HTML ya saneado por el pipeline del ACL.
 *
 * Existe para que ese HTML tenga un dueño: el `bypassSecurityTrustHtml` vive acá y no repartido por
 * las páginas que lo consumen, y las reglas tipográficas de los nodos que el pipeline emite —que no
 * llevan clases y por eso ninguna utilidad alcanza— se anclan a este selector de elemento, así que
 * viajan con el componente en vez de con una ruta.
 */
@Component({
	selector: 'cuentoneta-literary-work-prose',
	template: `<div [innerHTML]="safeBody()" data-testid="body"></div>`,
	host: {
		class: 'block source-serif-xl text-neutral-800',
	},
})
export class LiteraryWorkProseComponent {
	public readonly body = input.required<SanitizedHtml>();

	private readonly sanitizer = inject(DomSanitizer);

	// El HTML ya viene saneado del backend (única fuente: el pipeline del ACL); el bypass es la
	// confianza en esa frontera, no una sanitización propia. Sin él Angular recorta los atributos que
	// el propio pipeline inyecta en las imágenes.
	protected readonly safeBody = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.body()));
}
