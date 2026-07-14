import { Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { CoverImageSkeletonComponent } from '../cover-image/cover-image-skeleton.component';

@Component({
	selector: 'cuentoneta-collection-teaser-skeleton',
	imports: [SkeletonComponent, CoverImageSkeletonComponent],
	template: `
		<article class="flex items-start gap-5">
			<section class="flex h-[192px] flex-1 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3">
				<cuentoneta-cover-image-skeleton class="-mb-2" />
			</section>
			<section class="flex flex-1 flex-col gap-1 overflow-hidden">
				<cuentoneta-skeleton appearance="line" class="h-[18px] w-4/5 bg-neutral-300" />
				<div class="mt-1 flex flex-col gap-1.5">
					@for (line of [0, 1, 2]; track line) {
						<cuentoneta-skeleton appearance="line" class="h-[14px] w-full bg-neutral-300" />
					}
				</div>
				<footer class="mt-1 flex gap-1">
					<cuentoneta-skeleton appearance="line" class="h-[12px] w-20 bg-brand-300" />
					<cuentoneta-skeleton appearance="line" class="h-[12px] w-20 bg-neutral-300" />
				</footer>
			</section>
		</article>
	`,
})
export class CollectionTeaserSkeletonComponent {}
