// Core
import { Component, computed, DestroyRef, effect, ElementRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// RxJS
import { interval, Subject } from 'rxjs';
import { filter, startWith, switchMap } from 'rxjs/operators';

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

	templateUrl: './carousel.component.html',
	styleUrl: './carousel.component.css',
	host: {
		class: 'mx-auto block',
		'[style.--transition-duration]': 'transitionDuration() + "ms"',
	},
})
export class CarouselComponent {
	// Servicios
	private readonly layoutService = inject(LayoutService);
	private readonly stateService = inject(CarouselStateService);
	private readonly gestureService = inject(CarouselGestureService);
	private readonly el = inject(ElementRef);
	private readonly destroyRef = inject(DestroyRef);

	// Entradas
	public readonly slides = input<ContentCampaign[]>([]);
	public readonly transitionDuration = input<number>(600);
	public readonly autoPlayInterval = input<number>(5000);

	// Signals de estado - Auto-reproducción
	public readonly isPaused = signal(false);

	// Exponer signals del servicio de estado para el template
	public readonly activeIndex = this.stateService.activeIndex;
	public readonly previousIndex = this.stateService.previousIndex;
	public readonly isTransitioning = this.stateService.isTransitioning;
	public readonly direction = this.stateService.direction;

	// Signals computadas
	public readonly slideCount = computed(() => this.slides().length);
	protected readonly viewport = computed(() => {
		const isTabletOrDesktop = this.layoutService.biggerThan('xs');
		return isTabletOrDesktop ? 'md' : 'xs';
	});
	public readonly showControls = computed(() => this.layoutService.biggerThan('xs'));

	// Constantes
	protected readonly viewportSpecificClasses: { [key in ContentCampaignViewport]: string } = {
		xs: 'sm:hidden',
		md: 'max-sm:hidden',
	};

	// Subject para reiniciar el timer de auto-play después de interacción del usuario
	private readonly restartAutoPlay$ = new Subject<void>();

	// Intervalo de reproducción automática con reinicio después de interacción
	private autoPlayInterval$ = this.restartAutoPlay$.pipe(
		startWith(undefined),
		switchMap(() => interval(this.autoPlayInterval())),
		filter(
			() => !this.isPaused() && !this.gestureService.isSwiping() && !this.isTransitioning() && this.slideCount() > 1,
		),
		takeUntilDestroyed(),
	);

	constructor() {
		// Inicializar servicio de estado con valores actuales
		this.stateService.initialize(this.slides().length, this.transitionDuration());

		// Efecto para sincronizar cambios en slides y pausar auto-play si es necesario
		effect(() => {
			const count = this.slides().length;
			this.stateService.updateSlideCount(count);
			// Pausar auto-play cuando hay 0 o 1 slide para evitar navegación inválida
			if (count <= 1) {
				this.isPaused.set(true);
			}
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
	public next(): void {
		this.stateService.next();
	}

	public prev(): void {
		this.stateService.prev();
	}

	public onIndicatorClick(index: number): void {
		this.stateService.onIndicatorClick(index);
	}

	// Métodos de control de auto-reproducción
	public pauseAutoPlay(): void {
		this.isPaused.set(true);
	}

	public resumeAutoPlay(): void {
		this.isPaused.set(false);
		this.restartAutoPlay$.next();
	}
}
