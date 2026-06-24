import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { CoverImageSkeletonComponent } from '../cover-image/cover-image-skeleton.component';

/**
 * Estado de carga (esqueleto) de HomeStoryCardComponent. Replica la estructura de la tarjeta
 * (cover sobre contenedor gris, autor, título y tiempo de lectura) con placeholders de
 * cuentoneta-skeleton para evitar saltos de layout mientras la story carga.
 */
@Component({
	selector: 'cuentoneta-home-story-card-skeleton',
	imports: [SkeletonComponent, CoverImageSkeletonComponent],
	host: { class: 'block' },
	template: `
		<article class="flex w-full max-w-82.75 flex-col items-center gap-4">
			<div class="flex w-full items-center justify-center rounded-xl bg-neutral-100 py-5">
				<cuentoneta-cover-image-skeleton />
			</div>
			<div class="flex w-full flex-col gap-1">
				<div class="flex items-center gap-2">
					<cuentoneta-skeleton appearance="circle" class="h-6 w-6 bg-neutral-300" />
					<cuentoneta-skeleton appearance="line" class="h-4 w-full max-w-40 bg-neutral-300" />
				</div>
				<cuentoneta-skeleton appearance="line" class="h-6 w-full max-w-48 bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-4 w-full max-w-36 bg-neutral-300" />
			</div>
		</article>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeStoryCardSkeletonComponent {}
