// Núcleo
import { ChangeDetectionStrategy, Component } from '@angular/core';

// Módulos de terceros
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-carousel-skeleton',
	imports: [NgxSkeletonLoaderModule],
	template: ` <div class="mx-auto">
		<div class="slider">
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
		</div>
	</div>`,
	styles: `
		@reference '../../../tailwind.css';

		:host ::ng-deep .carousel-image-skeleton .skeleton-loader {
			@apply bg-neutral-200;
		}

		:host ::ng-deep .carousel-text-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselSkeletonComponent {}
