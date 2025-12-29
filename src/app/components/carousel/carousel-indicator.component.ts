import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'cuentoneta-carousel-indicator',
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div
			[class.mobile]="device() === 'Mobile'"
			[class.desktop]="device() === 'Desktop'"
			class="carousel-indicator-container"
		>
			@for (item of slides(); track $index; let i = $index) {
				<button
					(click)="indicatorClick.emit(i)"
					[attr.aria-label]="'Go to slide ' + (i + 1)"
					[attr.aria-current]="i === activeIndex() ? 'true' : 'false'"
					class="indicator-button"
				>
					<div [class.active]="i === activeIndex()" class="indicator-item"></div>
				</button>
			}
		</div>
	`,
	styles: `
		:host {
			@apply block;
		}

		.carousel-indicator-container {
			@apply flex items-center gap-[10px] bg-white/15;
		}

		.carousel-indicator-container.desktop {
			@apply rounded-[10px] px-[8px] py-[6px];
		}

		.carousel-indicator-container.mobile {
			@apply rounded-[6px] px-[6px] py-[4px];
		}

		.indicator-button {
			@apply cursor-pointer border-0 p-0;
			background: transparent;
		}

		.indicator-item {
			@apply rounded-[1000px] transition-all duration-300;
		}

		.desktop .indicator-item {
			@apply h-[6px] w-[12px] bg-[#f0f0f0];
		}

		.desktop .indicator-item.active {
			@apply w-[24px] bg-[#b05d30];
		}

		.mobile .indicator-item {
			@apply h-[4px] w-[8px] bg-[#f0f0f0];
		}

		.mobile .indicator-item.active {
			@apply w-[16px] bg-[#b05d30];
		}
	`,
})
export class CarouselIndicatorComponent {
	// Entradas
	readonly slides = input.required<unknown[]>();
	readonly activeIndex = input.required<number>();
	readonly device = input<'Mobile' | 'Desktop'>('Desktop');

	// Salidas
	readonly indicatorClick = output<number>();
}
