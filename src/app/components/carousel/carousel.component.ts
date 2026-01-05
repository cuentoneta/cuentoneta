// Core
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// RxJS
import { fromEvent, interval } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';

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
		<section
			(mouseenter)="pauseAutoPlay()"
			(mouseleave)="resumeAutoPlay()"
			class="carousel-container relative"
			tabindex="0"
		>
			<!-- Diapositivas -->
			<div class="slide-wrapper" #slideWrapper>
				@for (slide of slides(); track slide.slug; let i = $index) {
					<!-- Diapositiva activa (entrando) -->
					@if (i === activeIndex()) {
						<div
							[class.slide-in-left]="direction() === 'left'"
							[class.slide-in-right]="direction() === 'right'"
							class="slide active"
						>
							<a [routerLink]="slide.url" [ngClass]="viewportSpecificClasses[viewport()]">
								<img
									[ngSrc]="slide.contents[viewport()].imageUrl"
									[width]="slide.contents[viewport()].imageWidth"
									[height]="slide.contents[viewport()].imageHeight"
									[alt]="'Imagen de la campaña de contenido ' + slide.title"
									class="rounded-2xl"
									priority
								/>
							</a>
						</div>
					}

					<!-- Diapositiva anterior (saliendo) -->
					@if (i === previousIndex() && previousIndex() !== null) {
						<div
							[class.slide-out-left]="direction() === 'left'"
							[class.slide-out-right]="direction() === 'right'"
							class="slide previous"
						>
							<a [routerLink]="slide.url" [ngClass]="viewportSpecificClasses[viewport()]">
								<img
									[ngSrc]="slide.contents[viewport()].imageUrl"
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
			@apply aspect-[540/220] sm:aspect-[960/280];
			@apply focus-visible:ring-primary-500 outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
		}

		.slide-wrapper {
			@apply relative h-full w-full;
			touch-action: pan-y; /* Permite scroll vertical, captura deslizamientos horizontales */
		}

		.slide {
			@apply absolute inset-0 h-full w-full;
			@apply transition-transform ease-in-out;
		}

		.slide.active {
			z-index: 2; /* Diapositiva activa en la parte superior */
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Sombra para separación visual */
		}

		.slide.previous {
			z-index: 1; /* Diapositiva anterior detrás */
		}

		.slide.slide-in-left {
			animation: slideInLeft 600ms ease-in-out;
		}

		.slide.slide-in-right {
			animation: slideInRight 600ms ease-in-out;
		}

		.slide.slide-out-left {
			animation: slideOutLeft 600ms ease-in-out;
		}

		.slide.slide-out-right {
			animation: slideOutRight 600ms ease-in-out;
		}

		@keyframes slideInLeft {
			from {
				transform: translateX(calc(100% + 20px)); /* Gap de 20px entre diapositivas */
			}
			to {
				transform: translateX(0);
			}
		}

		@keyframes slideInRight {
			from {
				transform: translateX(calc(-100% - 20px)); /* Gap de 20px entre diapositivas */
			}
			to {
				transform: translateX(0);
			}
		}

		@keyframes slideOutLeft {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(calc(-100% - 20px)); /* Gap de 20px entre diapositivas */
			}
		}

		@keyframes slideOutRight {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(calc(100% + 20px)); /* Gap de 20px entre diapositivas */
			}
		}

		/* Se usa z-index: 10 para mostrar controles por encima de las diapositivas */
		.carousel-control-left {
			@apply absolute left-0 top-1/2 z-10 -translate-y-1/2;
		}

		.carousel-control-right {
			@apply absolute right-0 top-1/2 z-10 -translate-y-1/2;
		}

		.carousel-indicators-wrapper {
			@apply absolute bottom-2 left-1/2 z-10 -translate-x-1/2 sm:bottom-4;
		}
	`,
})
export class CarouselComponent {
	// Servicios
	layoutService = inject(LayoutService);
	private el = inject(ElementRef);

	// Entradas
	readonly slides = input<ContentCampaign[]>([]);
	readonly transitionDuration = input<number>(600);

	// Señales de estado - Auto-reproducción
	readonly isPlaying = signal(true);
	readonly isPaused = signal(false);

	// Señales de estado - Navegación
	readonly activeIndex = signal(0);
	readonly previousIndex = signal<number | null>(null);
	readonly isTransitioning = signal(false);
	readonly direction = signal<'left' | 'right' | null>(null);

	// Señales de estado - Gestos táctiles
	readonly isSwiping = signal(false);
	readonly swipeStartX = signal<number | null>(null);
	readonly swipeCurrentX = signal<number | null>(null);

	// Señales computadas
	readonly slideCount = computed(() => this.slides().length);
	readonly viewport = computed(() => {
		const isTabletOrDesktop = this.layoutService.biggerThan('xs');
		return isTabletOrDesktop ? 'md' : 'xs';
	});
	readonly showControls = computed(() => this.layoutService.biggerThan('xs'));

	// Constantes
	readonly viewportSpecificClasses: { [key in ContentCampaignViewport]: string } = {
		xs: 'sm:hidden',
		md: 'max-sm:hidden',
	};
	private readonly SWIPE_THRESHOLD = 50; // Mínimo de píxeles para registrar como deslizamiento

	// Intervalo de reproducción automática
	private autoPlayInterval$ = interval(5000).pipe(
		filter(() => !this.isPaused() && this.isPlaying() && !this.isSwiping() && this.slideCount() > 1),
		takeUntilDestroyed(),
	);

	// Flujos de eventos táctiles
	private touchStart$ = fromEvent<TouchEvent>(this.el.nativeElement, 'touchstart').pipe(takeUntilDestroyed());
	private touchMove$ = fromEvent<TouchEvent>(this.el.nativeElement, 'touchmove').pipe(
		takeUntilDestroyed(),
		throttleTime(16), // ~60fps, previene problemas de rendimiento
	);
	private touchEnd$ = fromEvent<TouchEvent>(this.el.nativeElement, 'touchend').pipe(takeUntilDestroyed());
	private touchCancel$ = fromEvent<TouchEvent>(this.el.nativeElement, 'touchcancel').pipe(takeUntilDestroyed());

	// Flujo de eventos de teclado
	private keydown$ = fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown').pipe(takeUntilDestroyed());

	constructor() {
		// Suscripción a auto-reproducción
		this.autoPlayInterval$.subscribe(() => this.next());

		// Suscripciones a gestos táctiles
		this.touchStart$.subscribe((event) => this.handleTouchStart(event));
		this.touchMove$.subscribe((event) => this.handleTouchMove(event));
		this.touchEnd$.subscribe(() => this.handleTouchEnd());
		this.touchCancel$.subscribe(() => this.resetSwipeState());

		// Suscripción a eventos de teclado
		this.keydown$.subscribe((event) => this.handleKeydown(event));
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

		// Guardar índice anterior antes de cambiar
		this.previousIndex.set(this.activeIndex());
		this.activeIndex.set(index);

		// Reiniciar estado de transición después de que se complete la animación
		setTimeout(() => {
			this.isTransitioning.set(false);
			this.direction.set(null);
			this.previousIndex.set(null); // Limpiar diapositiva anterior
		}, this.transitionDuration());
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

	// Métodos de manejo de gestos táctiles
	private handleTouchStart(event: TouchEvent): void {
		// Guard: No interferir si está en transición
		if (this.isTransitioning()) return;

		// Guard: Solo procesar toques con un dedo
		if (event.touches.length !== 1) return;

		const touch = event.touches[0];
		this.isSwiping.set(true);
		this.swipeStartX.set(touch.clientX);
		this.swipeCurrentX.set(touch.clientX);

		// Pausar auto-reproducción durante el deslizamiento
		this.pauseAutoPlay();
	}

	private handleTouchMove(event: TouchEvent): void {
		if (!this.isSwiping()) return;
		if (event.touches.length !== 1) return;

		const touch = event.touches[0];
		this.swipeCurrentX.set(touch.clientX);

		// Prevenir scroll horizontal durante el deslizamiento
		// (Aún permite scroll vertical)
		const deltaX = Math.abs(touch.clientX - (this.swipeStartX() ?? 0));
		if (deltaX > 10) {
			event.preventDefault();
		}
	}

	private handleTouchEnd(): void {
		if (!this.isSwiping()) return;

		const startX = this.swipeStartX();
		const currentX = this.swipeCurrentX();

		if (startX === null || currentX === null) {
			this.resetSwipeState();
			return;
		}

		const deltaX = currentX - startX;
		const absDeltaX = Math.abs(deltaX);

		// Verificar si el deslizamiento cumple el umbral
		if (absDeltaX >= this.SWIPE_THRESHOLD) {
			if (deltaX > 0) {
				// Deslizamiento a la derecha → diapositiva anterior
				this.prev();
			} else {
				// Deslizamiento a la izquierda → diapositiva siguiente
				this.next();
			}
		}

		this.resetSwipeState();
	}

	private resetSwipeState(): void {
		this.isSwiping.set(false);
		this.swipeStartX.set(null);
		this.swipeCurrentX.set(null);

		// Reanudar auto-reproducción
		this.resumeAutoPlay();
	}

	// Métodos de manejo de teclado
	private handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			this.prev();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			this.next();
		}
	}
}
