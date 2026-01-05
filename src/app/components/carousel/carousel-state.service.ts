import { Injectable, Signal, signal } from '@angular/core';

/**
 * Servicio que maneja el estado de navegación del carousel.
 * Gestiona los índices de diapositivas, direcciones de transición y timing.
 */
@Injectable()
export class CarouselStateService {
	// Signals de estado - Navegación
	private readonly _activeIndex = signal(0);
	private readonly _previousIndex = signal<number | null>(null);
	private readonly _isTransitioning = signal(false);
	private readonly _direction = signal<'left' | 'right' | null>(null);

	// Configuración
	private readonly _slideCount = signal(0);
	private readonly _transitionDuration = signal(600);

	// Signals públicas de solo lectura
	readonly activeIndex: Signal<number> = this._activeIndex.asReadonly();
	readonly previousIndex: Signal<number | null> = this._previousIndex.asReadonly();
	readonly isTransitioning: Signal<boolean> = this._isTransitioning.asReadonly();
	readonly direction: Signal<'left' | 'right' | null> = this._direction.asReadonly();
	readonly slideCount: Signal<number> = this._slideCount.asReadonly();

	/**
	 * Inicializa el servicio con la cantidad de diapositivas y duración de transición.
	 */
	initialize(slideCount: number, transitionDuration: number): void {
		this._slideCount.set(slideCount);
		this._transitionDuration.set(transitionDuration);
	}

	/**
	 * Actualiza la cantidad de diapositivas (para cuando cambia el input).
	 */
	updateSlideCount(count: number): void {
		this._slideCount.set(count);
	}

	/**
	 * Navega a la siguiente diapositiva.
	 */
	next(): void {
		if (this._isTransitioning()) return;

		const nextIndex = this._activeIndex() + 1;
		if (nextIndex >= this._slideCount()) {
			this.selectSlide(0, 'left');
		} else {
			this.selectSlide(nextIndex, 'left');
		}
	}

	/**
	 * Navega a la diapositiva anterior.
	 */
	prev(): void {
		if (this._isTransitioning()) return;

		const prevIndex = this._activeIndex() - 1;
		if (prevIndex < 0) {
			this.selectSlide(this._slideCount() - 1, 'right');
		} else {
			this.selectSlide(prevIndex, 'right');
		}
	}

	/**
	 * Selecciona una diapositiva específica con la dirección de animación indicada.
	 */
	selectSlide(index: number, direction: 'left' | 'right'): void {
		if (this._isTransitioning() || index === this._activeIndex()) return;

		this._isTransitioning.set(true);
		this._direction.set(direction);

		// Guardar índice anterior antes de cambiar
		this._previousIndex.set(this._activeIndex());
		this._activeIndex.set(index);

		// Reiniciar estado de transición después de que se complete la animación
		setTimeout(() => {
			this._isTransitioning.set(false);
			this._direction.set(null);
			this._previousIndex.set(null);
		}, this._transitionDuration());
	}

	/**
	 * Maneja el clic en un indicador, determinando la dirección automáticamente.
	 */
	onIndicatorClick(index: number): void {
		const direction = index > this._activeIndex() ? 'left' : 'right';
		this.selectSlide(index, direction);
	}
}
