import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Skeleton de carga de `AuthorTeaserV3`: reproduce su layout (avatar circular de 80px + columna con
 * tags, nombre y cantidad de historias) mientras se cargan los datos del autor.
 */
@Component({
	selector: 'cuentoneta-author-teaser-v3-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'block w-full' },
	template: `
		<article class="flex items-start gap-4">
			<cuentoneta-skeleton appearance="circle" class="w-20 shrink-0 bg-neutral-300" />
			<div class="flex min-w-0 flex-1 flex-col gap-1 pt-1">
				<div class="flex flex-wrap items-center gap-1.5">
					<cuentoneta-skeleton appearance="line" class="h-[22px] w-[72px] bg-brand-100" />
					<cuentoneta-skeleton appearance="line" class="h-[22px] w-[72px] bg-brand-100" />
				</div>
				<cuentoneta-skeleton appearance="line" class="h-[28px] w-[160px] bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-4 w-20 bg-neutral-300" />
			</div>
		</article>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorTeaserV3SkeletonComponent {}
