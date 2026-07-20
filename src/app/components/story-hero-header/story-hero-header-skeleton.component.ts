import { Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { CoverImageSkeletonComponent } from '../cover-image/cover-image-skeleton.component';

/**
 * Estado de carga (esqueleto) de StoryHeroHeaderComponent. Replica la banda oscura del hero y la
 * grilla portada + metadatos con placeholders de cuentoneta-skeleton para evitar saltos de layout
 * mientras la story carga. Los placeholders usan neutral-700 para contrastar sobre el fondo oscuro.
 */
@Component({
	selector: 'cuentoneta-story-hero-header-skeleton',
	imports: [SkeletonComponent, CoverImageSkeletonComponent],
	host: { class: 'relative block overflow-hidden bg-neutral-900' },
	template: `
		<div class="relative z-10 px-6 pt-28 pb-10">
			<div class="mx-auto flex w-full max-w-180 items-center gap-8">
				<cuentoneta-cover-image-skeleton />
				<div class="flex min-w-0 flex-1 flex-col items-start gap-2.5">
					<cuentoneta-skeleton appearance="line" class="h-5.5 w-24 rounded-sm bg-neutral-700" />
					<div class="flex items-center gap-2">
						<cuentoneta-skeleton appearance="circle" class="h-6 w-6 bg-neutral-700" />
						<cuentoneta-skeleton appearance="line" class="h-5 w-40 bg-neutral-700" />
					</div>
					<cuentoneta-skeleton appearance="line" class="h-8 w-full max-w-142 bg-neutral-700" />
					<cuentoneta-skeleton appearance="line" class="h-5 w-52 bg-neutral-700" />
				</div>
			</div>
		</div>
	`,
})
export class StoryHeroHeaderSkeletonComponent {}
