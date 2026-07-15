import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * Imagen de portada (cover) de una historia para las tarjetas del Design System v3. El host ES la
 * caja de la portada (tamaño fijo 118×164, recortada y con fondo neutro); el consumidor controla su
 * ubicación dentro de la tarjeta con clases utilitarias (p. ej. `order-last`). Si no se provee `src`,
 * muestra el placeholder del Design System. Es decorativa: el click se delega al enlace de la tarjeta,
 * por eso el `alt` queda vacío.
 */
@Component({
	selector: 'cuentoneta-cover-image',
	imports: [NgOptimizedImage],
	host: {
		class: 'block h-41 w-29.5 shrink-0 overflow-hidden rounded-lg bg-neutral-300',
	},
	template: `
		@if (src(); as url) {
			<img
				[ngSrc]="url"
				[priority]="priority()"
				class="h-auto w-full"
				width="118"
				height="164"
				alt=""
				data-testid="cover-image"
			/>
		} @else {
			<div class="flex h-full w-full items-center justify-center" data-testid="cover-placeholder">
				<img ngSrc="./assets/svg/cover-placeholder.svg" width="60" height="60" alt="" />
			</div>
		}
	`,
})
export class CoverImageComponent {
	// URL de la imagen; si no se provee, se muestra el placeholder del Design System.
	public readonly src = input<string>();
	// Marca el cover como prioritario (above-the-fold) para la carga de imágenes.
	public readonly priority = input<boolean>(false);
}
