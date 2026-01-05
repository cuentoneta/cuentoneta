// Core
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
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
import { CarouselStateService } from './carousel-state.service';
import { CarouselGestureService } from './carousel-gesture.service';

@Component({
	selector: 'cuentoneta-carousel',
	imports: [NgOptimizedImage, RouterLink, CarouselIndicatorComponent, CarouselControlsComponent],
	providers: [CarouselStateService, CarouselGestureService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './carousel.component.html',
	styleUrl: './carousel.component.css',
})
export class CarouselComponent {
	// Servicios
	private readonly layoutService = inject(LayoutService);
	private readonly stateService = inject(CarouselStateService);
	private readonly gestureService = inject(CarouselGestureService);
	private readonly el = inject(ElementRef);
	private readonly destroyRef = inject(DestroyRef);

	// Entradas
	readonly slides = input<ContentCampaign[]>([]);
	readonly transitionDuration = input<number>(600);

	// Señales de estado - Auto-reproducción
	readonly isPaused = signal(false);

	// Exponer señales del servicio de estado para el template
	readonly activeIndex = this.stateService.activeIndex;
	readonly previousIndex = this.stateService.previousIndex;
	readonly isTransitioning = this.stateService.isTransitioning;
	readonly direction = this.stateService.direction;

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

	// Intervalo de reproducción automática
	private autoPlayInterval$ = interval(5000).pipe(
		filter(
			() => !this.isPaused() && !this.gestureService.isSwiping() && !this.isTransitioning() && this.slideCount() > 1,
		),
		takeUntilDestroyed(),
	);

	constructor() {
		// Inicializar servicio de estado con valores actuales
		this.stateService.initialize(this.slides().length, this.transitionDuration());

		// Efecto para sincronizar cambios en slides
		effect(() => {
			this.stateService.updateSlideCount(this.slides().length);
		});

		// Suscripción a auto-reproducción
		this.autoPlayInterval$.subscribe(() => this.stateService.next());

		// Adjuntar servicio de gestos y conectar comandos de navegación
		this.gestureService
			.attach(this.el, this.destroyRef, this.isTransitioning)
			.pipe(takeUntilDestroyed())
			.subscribe((command) => {
				if (command === 'next') {
					this.stateService.next();
				} else {
					this.stateService.prev();
				}
			});

		// Coordinar pausa/reanudación de auto-play con deslizamientos
		this.gestureService.onSwipeStart$.pipe(takeUntilDestroyed()).subscribe(() => this.pauseAutoPlay());
		this.gestureService.onSwipeEnd$.pipe(takeUntilDestroyed()).subscribe(() => this.resumeAutoPlay());
	}

	// Métodos de navegación (delegados al servicio)
	next(): void {
		this.stateService.next();
	}

	prev(): void {
		this.stateService.prev();
	}

	onIndicatorClick(index: number): void {
		this.stateService.onIndicatorClick(index);
	}

	// Métodos de control de auto-reproducción
	pauseAutoPlay(): void {
		this.isPaused.set(true);
	}

	resumeAutoPlay(): void {
		this.isPaused.set(false);
	}
}
