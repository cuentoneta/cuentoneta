import { Directive, effect, inject } from '@angular/core';

import { type SearchImage } from '@utils/sanity-image.utils';
import { HeadMetadata } from './head-metadata.directive';

@Directive()
export abstract class AbstractMetaTags {
	protected readonly head = inject(HeadMetadata);

	protected abstract applyMetaTags(): void;

	// Sin imagen propia se repone el default: en la navegación entre páginas del mismo tipo la directiva
	// no se destruye, y el og:image de la entidad anterior quedaría en la cabecera.
	protected applySearchImage(image: SearchImage | undefined): void {
		if (image) {
			this.head.setOgImage(image.url);
		} else {
			this.head.removeImage();
		}
	}

	private readonly metaTagsEffect = effect(() => {
		this.applyMetaTags();
	});
}
