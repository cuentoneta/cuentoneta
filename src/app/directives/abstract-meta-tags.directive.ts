import { Directive, effect, inject } from '@angular/core';

import { HeadMetadataDirective } from './head-metadata.directive';

@Directive()
export abstract class AbstractMetaTagsDirective {
	protected readonly head = inject(HeadMetadataDirective);

	protected abstract applyMetaTags(): void;

	// El reset al destruir lo maneja HeadMetadataDirective (resetTagsOnDestroy); por eso no hay cleanup acá.
	private readonly metaTagsEffect = effect(() => {
		this.applyMetaTags();
	});
}
