import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO: Generar barra de progresso utilizando TypeScript y lectura del DOM, para mejorar feature
@Component({
	selector: 'cuentoneta-progress-bar',
	imports: [],
	template: ` <div class="progress-bar bg-primary-400 h-full w-0" data-testid="progress-bar"></div>`,
	styles: `
		@reference "tailwindcss";
		:host {
			@apply bg-primary-100 sticky z-10 col-span-full h-2 w-full overflow-hidden;
			transition: top 200ms ease-in-out;
		}

		.progress-bar {
			transition-timing-function: ease-out;
			transition: width 0.5s;
			animation: scrollbar linear;
			animation-timeline: scroll(root);
		}

		@keyframes scrollbar {
			to {
				width: 100%;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {}
