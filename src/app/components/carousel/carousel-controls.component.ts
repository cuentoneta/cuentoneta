import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronLeft, faSolidChevronRight } from '@ng-icons/font-awesome/solid';

@Component({
	selector: 'cuentoneta-carousel-controls',
	imports: [NgIcon],
	providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<button
			(click)="controlClick.emit()"
			[disabled]="disabled()"
			[class.left]="type() === 'left'"
			[class.right]="type() === 'right'"
			[attr.aria-label]="type() === 'left' ? 'Previous slide' : 'Next slide'"
			class="carousel-control"
		>
			<ng-icon [name]="type() === 'left' ? 'faSolidChevronLeft' : 'faSolidChevronRight'" size="24" />
		</button>
	`,
	styles: `
		:host {
			@apply block;
		}

		.carousel-control {
			@apply flex items-center justify-center bg-white/15;
			@apply relative py-[24px];
			@apply transition-colors hover:bg-white/25;
			@apply disabled:cursor-not-allowed disabled:opacity-50;
			@apply cursor-pointer border-0;

			&.left {
				@apply pl-[4px] pr-[6px];
				@apply rounded-br-[12px] rounded-tr-[12px];
			}

			&.right {
				@apply pl-[6px] pr-[4px];
				@apply rounded-bl-[12px] rounded-tl-[12px];
			}

			ng-icon {
				@apply text-[#fafafa];
			}
		}
	`,
})
export class CarouselControlsComponent {
	// Entradas
	readonly type = input.required<'left' | 'right'>();
	readonly disabled = input<boolean>(false);

	// Salidas
	readonly controlClick = output<void>();
}
