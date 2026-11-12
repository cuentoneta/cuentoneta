import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import type { SanityImageLoaderParams } from '../../providers/sanity-image-loader';

/**
 * Imagen de portada (cover) de una obra para las tarjetas del Design System v3. El host ES la
 * caja de la portada: de alto fijo y de ancho el que resulte de la proporción de la imagen. El tope
 * de ancho evita que una imagen muy apaisada ocupe la tarjeta y deje sin lugar a su columna de texto;
 * pasado el tope se recorta el excedente. Sin `src` muestra el placeholder del Design System, con el
 * ancho por defecto de 118. El consumidor controla su ubicación dentro de la tarjeta con clases
 * utilitarias (p. ej. `order-last`). Es decorativa: el click se delega al enlace de la tarjeta, por eso
 * el `alt` queda vacío.
 */
@Component({
	selector: 'cuentoneta-cover-image',
	imports: [NgOptimizedImage],
	host: {
		class: 'block h-41 w-fit max-w-33 shrink-0 overflow-hidden rounded-lg bg-neutral-300',
	},
	template: `
		@if (src(); as url) {
			<img
				[ngSrc]="url"
				[priority]="priority()"
				[loaderParams]="loaderParams"
				class="h-full w-auto max-w-full object-cover"
				width="118"
				height="164"
				alt=""
				data-testid="cover-image"
			/>
		} @else {
			<div class="flex h-full w-29.5 items-center justify-center" data-testid="cover-placeholder">
				<img ngSrc="./assets/svg/cover-placeholder.svg" width="60" height="60" alt="" />
			</div>
		}
	`,
})
export class CoverImage {
	// URL de la imagen; si no se provee, se muestra el placeholder del Design System.
	public readonly src = input<string>();
	// Marca el cover como prioritario (above-the-fold) para la carga de imágenes.
	public readonly priority = input<boolean>(false);

	private readonly loaderParams: SanityImageLoaderParams = { heightRatio: 164 / 118 };
}
