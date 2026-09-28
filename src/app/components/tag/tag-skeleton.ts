import { Component } from '@angular/core';

import { Skeleton } from '@components/skeleton/skeleton';

@Component({
	selector: 'cuentoneta-tag-skeleton',
	imports: [Skeleton],
	host: { class: 'inline-block' },
	template: `<cuentoneta-skeleton appearance="square" class="h-[22px] w-[72px] rounded-sm bg-neutral-200" />`,
})
export class TagSkeleton {}
