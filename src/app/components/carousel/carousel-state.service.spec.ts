import { CarouselStateService } from './carousel-state.service';

describe('CarouselStateService', () => {
	let service: CarouselStateService;

	beforeEach(() => {
		service = new CarouselStateService();
	});

	describe('initialization', () => {
		it('should start with activeIndex at 0', () => {
			expect(service.activeIndex()).toBe(0);
		});

		it('should start with previousIndex as null', () => {
			expect(service.previousIndex()).toBeNull();
		});

		it('should start with isTransitioning as false', () => {
			expect(service.isTransitioning()).toBe(false);
		});

		it('should start with direction as null', () => {
			expect(service.direction()).toBeNull();
		});

		it('should initialize with provided slide count and transition duration', () => {
			service.initialize(5, 800);
			expect(service.slideCount()).toBe(5);
		});
	});

	describe('updateSlideCount', () => {
		it('should update slide count', () => {
			service.initialize(3, 600);
			expect(service.slideCount()).toBe(3);

			service.updateSlideCount(5);
			expect(service.slideCount()).toBe(5);
		});
	});

	describe('next()', () => {
		beforeEach(() => {
			service.initialize(4, 100); // 4 slides, 100ms transition for faster tests
		});

		it('should navigate to next slide', () => {
			expect(service.activeIndex()).toBe(0);

			service.next();

			expect(service.activeIndex()).toBe(1);
		});

		it('should set direction to left when navigating next', () => {
			service.next();

			expect(service.direction()).toBe('left');
		});

		it('should set previousIndex to old activeIndex', () => {
			expect(service.previousIndex()).toBeNull();

			service.next();

			expect(service.previousIndex()).toBe(0);
		});

		it('should set isTransitioning to true', () => {
			service.next();

			expect(service.isTransitioning()).toBe(true);
		});

		it('should loop to first slide when at end', async () => {
			// Navigate to last slide
			service.next(); // 0 -> 1
			await waitForTransition(150);
			service.next(); // 1 -> 2
			await waitForTransition(150);
			service.next(); // 2 -> 3
			await waitForTransition(150);

			expect(service.activeIndex()).toBe(3);

			service.next(); // 3 -> 0 (loop)

			expect(service.activeIndex()).toBe(0);
		});

		it('should not navigate while transitioning', () => {
			service.next(); // Start transition
			expect(service.activeIndex()).toBe(1);

			service.next(); // Try to navigate again

			expect(service.activeIndex()).toBe(1); // Should still be 1
		});

		it('should clear transition state after duration', async () => {
			service.next();

			expect(service.isTransitioning()).toBe(true);
			expect(service.direction()).toBe('left');
			expect(service.previousIndex()).toBe(0);

			await waitForTransition(150);

			expect(service.isTransitioning()).toBe(false);
			expect(service.direction()).toBeNull();
			expect(service.previousIndex()).toBeNull();
		});
	});

	describe('prev()', () => {
		beforeEach(() => {
			service.initialize(4, 100);
		});

		it('should navigate to previous slide', async () => {
			// First go to slide 2
			service.next();
			await waitForTransition(150);
			service.next();
			await waitForTransition(150);

			expect(service.activeIndex()).toBe(2);

			service.prev();

			expect(service.activeIndex()).toBe(1);
		});

		it('should set direction to right when navigating prev', async () => {
			service.next();
			await waitForTransition(150);

			service.prev();

			expect(service.direction()).toBe('right');
		});

		it('should loop to last slide when at start', () => {
			expect(service.activeIndex()).toBe(0);

			service.prev();

			expect(service.activeIndex()).toBe(3); // Last slide (index 3 for 4 slides)
		});

		it('should not navigate while transitioning', () => {
			service.prev(); // Start transition to last slide
			expect(service.activeIndex()).toBe(3);

			service.prev(); // Try to navigate again

			expect(service.activeIndex()).toBe(3); // Should still be 3
		});
	});

	describe('selectSlide()', () => {
		beforeEach(() => {
			service.initialize(5, 100);
		});

		it('should navigate to specified slide with left direction', () => {
			service.selectSlide(3, 'left');

			expect(service.activeIndex()).toBe(3);
			expect(service.direction()).toBe('left');
		});

		it('should navigate to specified slide with right direction', () => {
			service.selectSlide(2, 'right');

			expect(service.activeIndex()).toBe(2);
			expect(service.direction()).toBe('right');
		});

		it('should not navigate to same slide', () => {
			service.selectSlide(0, 'left');

			// Should not start transition since we're already at slide 0
			expect(service.isTransitioning()).toBe(false);
		});

		it('should not navigate while transitioning', () => {
			service.selectSlide(2, 'left');
			expect(service.activeIndex()).toBe(2);

			service.selectSlide(4, 'left'); // Try to navigate while transitioning

			expect(service.activeIndex()).toBe(2); // Should still be 2
		});

		it('should set previousIndex correctly', () => {
			service.selectSlide(3, 'left');

			expect(service.previousIndex()).toBe(0);
		});
	});

	describe('onIndicatorClick()', () => {
		beforeEach(() => {
			service.initialize(5, 100);
		});

		it('should set direction to left when clicking indicator ahead', () => {
			service.onIndicatorClick(3);

			expect(service.activeIndex()).toBe(3);
			expect(service.direction()).toBe('left');
		});

		it('should set direction to right when clicking indicator behind', async () => {
			// First navigate to slide 3
			service.selectSlide(3, 'left');
			await waitForTransition(150);

			service.onIndicatorClick(1);

			expect(service.activeIndex()).toBe(1);
			expect(service.direction()).toBe('right');
		});

		it('should not navigate when clicking current slide indicator', () => {
			service.onIndicatorClick(0);

			expect(service.isTransitioning()).toBe(false);
		});
	});
});

function waitForTransition(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
