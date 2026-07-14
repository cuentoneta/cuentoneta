import { Component, computed, input, output } from '@angular/core';

@Component({
	selector: 'cuentoneta-carousel-indicator',
	host: { class: 'block' },

	template: `
		<div
			[class.mobile]="device() === 'Mobile'"
			[class.desktop]="device() === 'Desktop'"
			class="carousel-indicator-container"
		>
			@for (i of indices(); track i) {
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
		@reference '#tailwind-theme';

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
			@apply h-[6px] w-[12px] bg-neutral-150;
		}

		.desktop .indicator-item.active {
			@apply w-[24px] bg-brand-500;
		}

		.mobile .indicator-item {
			@apply h-[4px] w-[8px] bg-neutral-150;
		}

		.mobile .indicator-item.active {
			@apply w-[16px] bg-brand-500;
		}
	`,
})
export class CarouselIndicatorComponent {
	// Entradas
	public readonly count = input.required<number>();
	public readonly activeIndex = input.required<number>();
	public readonly device = input<'Mobile' | 'Desktop'>('Desktop');

	// Señales computadas
	protected readonly indices = computed(() => Array.from({ length: this.count() }, (_, i) => i));

	// Salidas
	public readonly indicatorClick = output<number>();
}
