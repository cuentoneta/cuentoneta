// Núcleo
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// RxJS
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';

// Componentes
import { CarouselIndicatorComponent } from './carousel-indicator.component';
import { CarouselControlsComponent } from './carousel-controls.component';

// Modelos
import { ContentCampaign, ContentCampaignViewport } from '@models/content-campaign.model';

// Servicios
import { LayoutService } from '../../providers/layout.service';

@Component({
	selector: 'cuentoneta-carousel',
	imports: [CommonModule, NgOptimizedImage, RouterLink, CarouselIndicatorComponent, CarouselControlsComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<section (mouseenter)="pauseAutoPlay()" (mouseleave)="resumeAutoPlay()" class="carousel-container relative">
			<!-- Diapositivas -->
			<div class="slide-wrapper">
				@for (slide of slides(); track slide.slug; let i = $index) {
					@if (i === activeIndex()) {
						<div
							[class.slide-in-left]="direction() === 'left'"
							[class.slide-in-right]="direction() === 'right'"
							class="slide active"
						>
							<a [routerLink]="slide.url" [ngClass]="viewportSpecificClasses[viewport()]">
								<img
									[ngSrc]="sanityFormatImageUrl(slide.contents[viewport()].imageUrl)"
									[width]="slide.contents[viewport()].imageWidth"
									[height]="slide.contents[viewport()].imageHeight"
									[alt]="'Imagen de la campaña de contenido ' + slide.title"
									class="rounded-2xl"
									priority
								/>
							</a>
						</div>
					}
				}
			</div>

			<!-- Controles de navegación (solo escritorio) -->
			@if (showControls()) {
				<div class="carousel-control-left">
					<cuentoneta-carousel-controls (controlClick)="prev()" [disabled]="isTransitioning()" type="left" />
				</div>

				<div class="carousel-control-right">
					<cuentoneta-carousel-controls (controlClick)="next()" [disabled]="isTransitioning()" type="right" />
				</div>
			}

			<!-- Indicadores de progreso -->
			<div class="carousel-indicators-wrapper">
				<cuentoneta-carousel-indicator
					(indicatorClick)="onIndicatorClick($event)"
					[slides]="slides()"
					[activeIndex]="activeIndex()"
					[device]="viewport() === 'xs' ? 'Mobile' : 'Desktop'"
				/>
			</div>
		</section>
	`,
	styles: `
		:host {
			@apply mx-auto block max-w-[960px];
		}

		.carousel-container {
			@apply relative overflow-hidden rounded-2xl;
			@apply aspect-[540/220] md:aspect-[960/280];
		}

		.slide-wrapper {
			@apply relative h-full w-full;
		}

		.slide {
			@apply absolute inset-0 h-full w-full;
			@apply transition-transform ease-in-out;
		}

		.slide.slide-in-left {
			animation: slideInLeft 1200ms ease-in-out;
		}

		.slide.slide-in-right {
			animation: slideInRight 1200ms ease-in-out;
		}

		@keyframes slideInLeft {
			from {
				transform: translateX(100%);
			}
			to {
				transform: translateX(0);
			}
		}

		@keyframes slideInRight {
			from {
				transform: translateX(-100%);
			}
			to {
				transform: translateX(0);
			}
		}

		.carousel-control-left {
			@apply absolute left-0 top-1/2 -translate-y-1/2;
		}

		.carousel-control-right {
			@apply absolute right-0 top-1/2 -translate-y-1/2;
		}

		.carousel-indicators-wrapper {
			@apply absolute bottom-4 left-1/2 -translate-x-1/2;
		}
	`,
})
export class CarouselComponent {
	// Servicios
	layoutService = inject(LayoutService);

	// Entradas
	readonly slides = input<ContentCampaign[]>([]);

	// Señales de estado
	readonly activeIndex = signal(0);
	readonly isPlaying = signal(true);
	readonly isPaused = signal(false);
	readonly isTransitioning = signal(false);
	readonly direction = signal<'left' | 'right' | null>(null);

	// Señales computadas
	readonly slideCount = computed(() => this.slides().length);
	readonly activeSlide = computed(() => this.slides()[this.activeIndex()]);
	readonly viewport = computed(() => {
		const isTabletOrDesktop = this.layoutService.biggerThan('xs');
		return isTabletOrDesktop ? 'md' : 'xs';
	});
	readonly showControls = computed(() => this.layoutService.biggerThan('xs'));

	// Constantes
	readonly viewportSpecificClasses: { [key in ContentCampaignViewport]: string } = {
		xs: 'md:hidden',
		md: 'max-md:hidden',
	};

	// Intervalo de reproducción automática
	private autoPlayInterval$ = interval(5000).pipe(
		filter(() => !this.isPaused() && this.isPlaying() && this.slideCount() > 1),
		takeUntilDestroyed(),
	);

	constructor() {
		this.autoPlayInterval$.subscribe(() => this.next());
	}

	// Métodos de navegación
	next(): void {
		if (this.isTransitioning()) return;

		const nextIndex = this.activeIndex() + 1;
		if (nextIndex >= this.slideCount()) {
			this.selectSlide(0, 'left');
		} else {
			this.selectSlide(nextIndex, 'left');
		}
	}

	prev(): void {
		if (this.isTransitioning()) return;

		const prevIndex = this.activeIndex() - 1;
		if (prevIndex < 0) {
			this.selectSlide(this.slideCount() - 1, 'right');
		} else {
			this.selectSlide(prevIndex, 'right');
		}
	}

	selectSlide(index: number, direction: 'left' | 'right'): void {
		if (this.isTransitioning() || index === this.activeIndex()) return;

		this.isTransitioning.set(true);
		this.direction.set(direction);
		this.activeIndex.set(index);

		// Reiniciar estado de transición después de que se complete la animación
		setTimeout(() => {
			this.isTransitioning.set(false);
			this.direction.set(null);
		}, 1200);
	}

	onIndicatorClick(index: number): void {
		const direction = index > this.activeIndex() ? 'left' : 'right';
		this.selectSlide(index, direction);
	}

	pauseAutoPlay(): void {
		this.isPaused.set(true);
	}

	resumeAutoPlay(): void {
		this.isPaused.set(false);
	}

	sanityFormatImageUrl(url: string): string {
		return `${url}?auto=format`;
	}
}
