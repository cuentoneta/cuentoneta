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
		@reference '../../../tailwind.css';

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
				@apply pr-[6px] pl-[4px];
				@apply rounded-tr-[12px] rounded-br-[12px];
			}

			&.right {
				@apply pr-[4px] pl-[6px];
				@apply rounded-tl-[12px] rounded-bl-[12px];
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
