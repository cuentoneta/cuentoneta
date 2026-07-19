import { Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/** Estado de carga de NavigableCollectionTeaser: círculo del ícono + línea del nombre + línea corta de metadatos. */
@Component({
	selector: 'cuentoneta-navigable-collection-teaser-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'block' },
	template: `
		<div class="flex items-center gap-3" data-testid="skeleton">
			<cuentoneta-skeleton appearance="circle" class="size-10 shrink-0 bg-neutral-300" />
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<cuentoneta-skeleton appearance="line" class="h-5 w-40 bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-4 w-24 bg-neutral-300" />
			</div>
		</div>
	`,
})
export class NavigableCollectionTeaserSkeletonComponent {}
