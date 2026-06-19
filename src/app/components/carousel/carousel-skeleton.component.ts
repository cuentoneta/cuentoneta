// Núcleo
import { ChangeDetectionStrategy, Component } from '@angular/core';

// Componentes
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-carousel-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'mx-auto block' },
	template: `<div class="slider">
		<cuentoneta-skeleton
			appearance="square"
			class="grid aspect-[540/220] w-full justify-self-center rounded-[16px] bg-neutral-200 object-cover md:aspect-[1240/360]"
		/>
	</div>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselSkeletonComponent {}
