// Núcleo
import { ChangeDetectionStrategy, Component } from '@angular/core';

// Módulos de terceros
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-carousel-skeleton',
	imports: [NgxSkeletonLoaderModule],
	host: { class: 'mx-auto block' },
	template: `<div class="slider">
		<ngx-skeleton-loader
			[theme]="{
				'justify-self': 'center',
				'border-radius.px': '16',
				'margin-bottom.px': 0,
				height: '100%',
				width: '100%',
			}"
			count="1"
			appearance="line"
			class="carousel-image-skeleton grid aspect-[540/220] w-full object-cover md:aspect-[1240/360]"
		/>
	</div>`,
	styles: `
		@reference '#tailwind-theme';

		:host ::ng-deep .carousel-image-skeleton .skeleton-loader {
			@apply bg-neutral-200;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselSkeletonComponent {}
