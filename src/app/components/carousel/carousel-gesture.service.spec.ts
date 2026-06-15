import { fn, spyOn } from '@test-utils';
import { DestroyRef, ElementRef, signal } from '@angular/core';
import { CarouselGestureService, NavigationCommand } from './carousel-gesture.service';

describe('CarouselGestureService', () => {
	let service: CarouselGestureService;
	let mockElement: HTMLElement;
	let mockElementRef: ElementRef;
	let mockDestroyRef: DestroyRef;
	let isTransitioning: ReturnType<typeof signal<boolean>>;

	beforeEach(() => {
		service = new CarouselGestureService();
		mockElement = document.createElement('div');
		mockElementRef = { nativeElement: mockElement };
		mockDestroyRef = {
			onDestroy: fn((_callback: () => void) => {
				// Store callback for potential cleanup simulation
			}),
		} as unknown as DestroyRef;
		isTransitioning = signal(false);
	});

	describe('initial state', () => {
		it('should start with isSwiping as false', () => {
			expect(service.isSwiping()).toBe(false);
		});
	});

	describe('attach()', () => {
		it('should return an observable of navigation commands', () => {
			const result = service.attach(mockElementRef, mockDestroyRef, isTransitioning);

			expect(result).toBeDefined();
			expect(typeof result.subscribe).toBe('function');
		});
	});

	describe('touch gesture handling', () => {
		let navigationCommands: NavigationCommand[];

		beforeEach(() => {
			navigationCommands = [];
			service.attach(mockElementRef, mockDestroyRef, isTransitioning).subscribe((command) => {
				navigationCommands.push(command);
			});
		});

		it('should set isSwiping to true on touchstart', () => {
			dispatchTouchEvent(mockElement, 'touchstart', 100, 100);

			expect(service.isSwiping()).toBe(true);
		});

		it('should emit onSwipeStart$ on touchstart', () =>
			new Promise<void>((resolve) => {
				service.onSwipeStart$.subscribe(() => {
					expect(true).toBe(true);
					resolve();
				});

				dispatchTouchEvent(mockElement, 'touchstart', 100, 100);
			}));

		it('should set isSwiping to false on touchend', () => {
			dispatchTouchEvent(mockElement, 'touchstart', 100, 100);
			expect(service.isSwiping()).toBe(true);

			dispatchTouchEvent(mockElement, 'touchend', 100, 100);

			expect(service.isSwiping()).toBe(false);
		});

		it('should emit onSwipeEnd$ on touchend', () =>
			new Promise<void>((resolve) => {
				service.onSwipeEnd$.subscribe(() => {
					expect(true).toBe(true);
					resolve();
				});

				dispatchTouchEvent(mockElement, 'touchstart', 100, 100);
				dispatchTouchEvent(mockElement, 'touchend', 100, 100);
			}));

		it('should emit "next" command on left swipe (swipe distance >= 50px)', () => {
			simulateSwipe(mockElement, 200, 100); // Swipe left by 100px

			expect(navigationCommands).toContain('next');
		});

		it('should emit "prev" command on right swipe (swipe distance >= 50px)', () => {
			simulateSwipe(mockElement, 100, 200); // Swipe right by 100px

			expect(navigationCommands).toContain('prev');
		});

		it('should not emit command if swipe distance is below threshold (< 50px)', () => {
			simulateSwipe(mockElement, 100, 130); // Swipe right by 30px (below threshold)

			expect(navigationCommands).toHaveLength(0);
		});

		it('should emit command at exactly 50px threshold', () => {
			simulateSwipe(mockElement, 150, 100); // Swipe left by exactly 50px

			expect(navigationCommands).toContain('next');
		});

		it('should not process touchstart while transitioning', () => {
			isTransitioning.set(true);

			dispatchTouchEvent(mockElement, 'touchstart', 100, 100);

			expect(service.isSwiping()).toBe(false);
		});

		it('should not process multi-touch (more than one finger)', () => {
			const touch1 = createTouch(100, 100);
			const touch2 = createTouch(200, 200);

			mockElement.dispatchEvent(
				new TouchEvent('touchstart', {
					touches: [touch1, touch2],
					changedTouches: [touch1, touch2],
					bubbles: true,
					cancelable: true,
				}),
			);

			expect(service.isSwiping()).toBe(false);
		});

		it('should reset swipe state on touchcancel', () => {
			dispatchTouchEvent(mockElement, 'touchstart', 100, 100);
			expect(service.isSwiping()).toBe(true);

			mockElement.dispatchEvent(new TouchEvent('touchcancel', { bubbles: true }));

			expect(service.isSwiping()).toBe(false);
		});

		it('should not emit command if touchend happens without touchstart', () => {
			dispatchTouchEvent(mockElement, 'touchend', 100, 100);

			expect(navigationCommands).toHaveLength(0);
		});
	});

	describe('keyboard navigation', () => {
		let navigationCommands: NavigationCommand[];

		beforeEach(() => {
			navigationCommands = [];
			service.attach(mockElementRef, mockDestroyRef, isTransitioning).subscribe((command) => {
				navigationCommands.push(command);
			});
		});

		it('should emit "prev" command on ArrowLeft key', () => {
			dispatchKeyboardEvent(mockElement, 'ArrowLeft');

			expect(navigationCommands).toContain('prev');
		});

		it('should emit "next" command on ArrowRight key', () => {
			dispatchKeyboardEvent(mockElement, 'ArrowRight');

			expect(navigationCommands).toContain('next');
		});

		it('should not emit command for other keys', () => {
			dispatchKeyboardEvent(mockElement, 'ArrowUp');
			dispatchKeyboardEvent(mockElement, 'ArrowDown');
			dispatchKeyboardEvent(mockElement, 'Enter');
			dispatchKeyboardEvent(mockElement, 'Space');

			expect(navigationCommands).toHaveLength(0);
		});

		it('should prevent default on arrow key events', () => {
			const event = new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				bubbles: true,
				cancelable: true,
			});
			const preventDefaultSpy = spyOn(event, 'preventDefault');

			mockElement.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
		});
	});

	describe('horizontal vs vertical swipe detection', () => {
		beforeEach(() => {
			service.attach(mockElementRef, mockDestroyRef, isTransitioning);
		});

		it('should prevent default when horizontal movement is dominant', () => {
			dispatchTouchEvent(mockElement, 'touchstart', 100, 100);

			const moveEvent = createTouchEvent('touchmove', 150, 105); // More horizontal than vertical
			const preventDefaultSpy = spyOn(moveEvent, 'preventDefault');

			mockElement.dispatchEvent(moveEvent);

			expect(preventDefaultSpy).toHaveBeenCalled();
		});

		it('should not prevent default when vertical movement is dominant', () => {
			dispatchTouchEvent(mockElement, 'touchstart', 100, 100);

			const moveEvent = createTouchEvent('touchmove', 105, 150); // More vertical than horizontal
			const preventDefaultSpy = spyOn(moveEvent, 'preventDefault');

			mockElement.dispatchEvent(moveEvent);

			expect(preventDefaultSpy).not.toHaveBeenCalled();
		});
	});
});

// Helper functions

function createTouch(clientX: number, clientY: number): Touch {
	return {
		clientX,
		clientY,
		identifier: 0,
		pageX: clientX,
		pageY: clientY,
		screenX: clientX,
		screenY: clientY,
		target: document.createElement('div'),
		radiusX: 0,
		radiusY: 0,
		rotationAngle: 0,
		force: 1,
	} as Touch;
}

function createTouchEvent(type: string, clientX: number, clientY: number): TouchEvent {
	const touch = createTouch(clientX, clientY);

	return new TouchEvent(type, {
		touches: type !== 'touchend' ? [touch] : [],
		changedTouches: [touch],
		cancelable: true,
		bubbles: true,
	});
}

function dispatchTouchEvent(element: HTMLElement, type: string, clientX: number, clientY: number): void {
	element.dispatchEvent(createTouchEvent(type, clientX, clientY));
}

function simulateSwipe(element: HTMLElement, startX: number, endX: number, y: number = 100): void {
	dispatchTouchEvent(element, 'touchstart', startX, y);
	dispatchTouchEvent(element, 'touchmove', endX, y);
	dispatchTouchEvent(element, 'touchend', endX, y);
}

function dispatchKeyboardEvent(element: HTMLElement, key: string): void {
	element.dispatchEvent(
		new KeyboardEvent('keydown', {
			key,
			bubbles: true,
			cancelable: true,
		}),
	);
}
