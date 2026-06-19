import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Skeleton de carga de `Tag`: reproduce la huella de una etiqueta (pill `rounded-sm`) del Design
 * System v3 mientras se cargan los datos. El consumidor lo usa en el mismo slot que `cuentoneta-tag`.
 */
@Component({
	selector: 'cuentoneta-tag-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'inline-block' },
	template: `<cuentoneta-skeleton appearance="square" class="h-[22px] w-[72px] rounded-sm bg-neutral-200" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagSkeletonComponent {}
