import { Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-tag-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'inline-block' },
	template: `<cuentoneta-skeleton appearance="square" class="h-[22px] w-[72px] rounded-sm bg-neutral-200" />`,
})
export class TagSkeletonComponent {}
