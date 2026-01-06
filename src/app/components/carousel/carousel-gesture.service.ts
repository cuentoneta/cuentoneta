import { DestroyRef, ElementRef, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, throttleTime } from 'rxjs/operators';

export type NavigationCommand = 'next' | 'prev';

/**
 * Servicio que maneja los gestos táctiles y eventos de teclado para el carousel.
 * Detecta deslizamientos y navegación por teclado, emitiendo comandos de navegación.
 */
@Injectable()
export class CarouselGestureService {
	// Umbral mínimo de píxeles para registrar como deslizamiento
	private readonly SWIPE_THRESHOLD = 50;
	// Intervalo de throttle para eventos de movimiento (~60fps)
	private readonly TOUCH_MOVE_THROTTLE_MS = 16;

	// Signals de estado de deslizamiento
	private readonly _isSwiping = signal(false);
	private readonly _swipeStartX = signal<number | null>(null);
	private readonly _swipeStartY = signal<number | null>(null);
	private readonly _swipeCurrentX = signal<number | null>(null);

	// Signal de solo lectura para informar si un deslizamiento está en proceso
	readonly isSwiping: Signal<boolean> = this._isSwiping.asReadonly();

	// Subjects para eventos del ciclo de vida del deslizamiento
	private readonly _swipeStart$ = new Subject<void>();
	private readonly _swipeEnd$ = new Subject<void>();

	// Observables públicos para coordinación con auto-play
	readonly onSwipeStart$: Observable<void> = this._swipeStart$.asObservable();
	readonly onSwipeEnd$: Observable<void> = this._swipeEnd$.asObservable();

	// Subject para comandos de navegación
	private readonly _navigationCommand$ = new Subject<NavigationCommand>();

	/**
	 * Adjunta los listeners de eventos al elemento y retorna un observable de comandos de navegación.
	 * @param element ElementRef del componente carousel
	 * @param destroyRef DestroyRef para limpieza automática
	 * @param isTransitioning Signal que indica si hay una transición en curso
	 */
	attach(element: ElementRef, destroyRef: DestroyRef, isTransitioning: Signal<boolean>): Observable<NavigationCommand> {
		// Flujos de eventos táctiles
		const touchStart$ = fromEvent<TouchEvent>(element.nativeElement, 'touchstart').pipe(takeUntilDestroyed(destroyRef));

		const touchMove$ = fromEvent<TouchEvent>(element.nativeElement, 'touchmove').pipe(
			takeUntilDestroyed(destroyRef),
			throttleTime(this.TOUCH_MOVE_THROTTLE_MS),
		);

		const touchEnd$ = fromEvent<TouchEvent>(element.nativeElement, 'touchend').pipe(takeUntilDestroyed(destroyRef));

		const touchCancel$ = fromEvent<TouchEvent>(element.nativeElement, 'touchcancel').pipe(
			takeUntilDestroyed(destroyRef),
		);

		// Flujo de eventos de teclado
		const keydown$ = fromEvent<KeyboardEvent>(element.nativeElement, 'keydown').pipe(takeUntilDestroyed(destroyRef));

		// Suscripciones a gestos táctiles
		touchStart$.subscribe((event) => this.handleTouchStart(event, isTransitioning));
		touchMove$.subscribe((event) => this.handleTouchMove(event));
		touchEnd$.subscribe(() => this.handleTouchEnd());
		touchCancel$.subscribe(() => this.resetSwipeState());

		// Suscripción a eventos de teclado
		keydown$
			.pipe(
				filter((event) => event.key === 'ArrowLeft' || event.key === 'ArrowRight'),
				map((event) => {
					event.preventDefault();
					return event.key === 'ArrowLeft' ? 'prev' : 'next';
				}),
			)
			.subscribe((command) => this._navigationCommand$.next(command));

		return this._navigationCommand$.asObservable();
	}

	private handleTouchStart(event: TouchEvent, isTransitioning: Signal<boolean>): void {
		// Guard: No interferir si está en transición
		if (isTransitioning()) return;

		// Guard: Solo procesar toques con un dedo
		if (event.touches.length !== 1) return;

		const touch = event.touches[0];
		this._isSwiping.set(true);
		this._swipeStartX.set(touch.clientX);
		this._swipeStartY.set(touch.clientY);
		this._swipeCurrentX.set(touch.clientX);

		// Emitir evento de inicio de deslizamiento
		this._swipeStart$.next();
	}

	private handleTouchMove(event: TouchEvent): void {
		if (!this._isSwiping()) return;
		if (event.touches.length !== 1) return;

		const touch = event.touches[0];
		this._swipeCurrentX.set(touch.clientX);

		// Solo prevenir scroll cuando el movimiento horizontal es dominante
		const deltaX = Math.abs(touch.clientX - (this._swipeStartX() ?? 0));
		const deltaY = Math.abs(touch.clientY - (this._swipeStartY() ?? 0));

		if (deltaX > deltaY && deltaX > 10) {
			event.preventDefault();
		}
	}

	private handleTouchEnd(): void {
		if (!this._isSwiping()) return;

		const startX = this._swipeStartX();
		const currentX = this._swipeCurrentX();

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
				this._navigationCommand$.next('prev');
			} else {
				// Deslizamiento a la izquierda → diapositiva siguiente
				this._navigationCommand$.next('next');
			}
		}

		this.resetSwipeState();
	}

	private resetSwipeState(): void {
		this._isSwiping.set(false);
		this._swipeStartX.set(null);
		this._swipeStartY.set(null);
		this._swipeCurrentX.set(null);

		// Emitir evento de fin de deslizamiento
		this._swipeEnd$.next();
	}
}
