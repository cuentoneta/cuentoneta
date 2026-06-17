import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-storylist-title-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'flex flex-col gap-5' },
	template: `
		<cuentoneta-skeleton appearance="line" class="h-[36px] w-[320px] bg-neutral-300" />
		<div class="flex gap-2">
			@for (tag of [0, 1, 2]; track tag) {
				<cuentoneta-skeleton appearance="line" class="h-5 w-[100px] bg-neutral-300" />
			}
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistTitleSkeleton {}
