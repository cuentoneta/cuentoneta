import { Directive, effect, inject } from '@angular/core';

import { HeadMetadata } from './head-metadata.directive';

@Directive()
export abstract class AbstractMetaTags {
	protected readonly head = inject(HeadMetadata);

	protected abstract applyMetaTags(): void;

	private readonly metaTagsEffect = effect(() => {
		this.applyMetaTags();
	});
}
