// Núcleo
import { ChangeDetectionStrategy, Component } from '@angular/core';

// Módulos de terceros
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-carousel-skeleton',
	imports: [NgxSkeletonLoaderModule],
	template: ` <div class="mx-auto max-w-[960px]">
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
				class="carousel-image-skeleton grid aspect-[540/220] w-full object-cover md:aspect-[960/280]"
			/>
		</div>
		<div class="footer mt-[10px] h-[27px]">
			<ngx-skeleton-loader
				[theme]="{
					'justify-self': 'center',
					'border-radius.px': '16',
					'margin-top.px': 5,
					'margin-bottom.px': 5,
					'width.px': 48,
					'height.px': 10,
				}"
				count="1"
				appearance="line"
				class="carousel-text-skeleton grid"
			/>
		</div>
	</div>`,
	styles: `
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
