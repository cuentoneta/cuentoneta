import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Estado de carga (esqueleto) de CoverImageComponent: reproduce la caja de la portada (118×164) con
 * un placeholder de cuentoneta-skeleton para evitar saltos de layout mientras la story carga.
 */
@Component({
	selector: 'cuentoneta-cover-image-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'block h-41 w-29.5 shrink-0' },
	template: `<cuentoneta-skeleton appearance="square" class="h-full w-full rounded-lg bg-neutral-300" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverImageSkeletonComponent {}
