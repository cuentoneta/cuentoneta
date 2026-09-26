// Núcleo
import { Component } from '@angular/core';

// Componentes
import { Skeleton } from '@components/skeleton/skeleton';

@Component({
	selector: 'cuentoneta-carousel-skeleton',
	imports: [Skeleton],
	host: { class: 'mx-auto block' },
	template: `<div class="slider">
		<cuentoneta-skeleton
			appearance="square"
			class="grid aspect-[540/220] w-full justify-self-center rounded-[16px] bg-neutral-200 object-cover sm:aspect-[1240/360]"
		/>
	</div>`,
})
export class CarouselSkeleton {}
