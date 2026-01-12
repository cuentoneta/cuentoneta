import { test, expect } from '@playwright/test';
import { setupHomePage, waitForElement, TEST_SELECTORS, CSS_CLASSES } from './home.utils';

test.describe('HomeComponent - Campaign Carousel Section', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should render campaign carousel section', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);
		const section = page.locator(TEST_SELECTORS.FIRST_SECTION).first();
		await expect(section).toBeVisible();

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		const skeleton = page.locator(TEST_SELECTORS.CAROUSEL_SKELETON);

		const carouselCount = await carousel.count();
		const skeletonCount = await skeleton.count();

		// At least one should be present
		expect(carouselCount + skeletonCount).toBeGreaterThan(0);

		// Document expected states
		if (carouselCount > 0) {
			await expect(carousel).toBeVisible();
		} else if (skeletonCount > 0) {
			await expect(skeleton).toBeVisible();
		}
	});

	test('should display carousel with slides after loading', async ({ page }) => {
		// Wait for skeleton to disappear and carousel to appear
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		await expect(carousel).toBeVisible();

		// Check for carousel container with slides
		const slideWrapper = carousel.locator('.slide-wrapper');
		await expect(slideWrapper).toBeVisible();
	});

	test('should have carousel slides with images', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		const slides = carousel.locator('.slide img');
		const count = await slides.count();
		expect(count).toBeGreaterThan(0);

		// Check first slide has valid image
		const firstSlide = slides.first();
		await expect(firstSlide).toHaveAttribute('src', /.+/);
	});

	test('should have carousel indicator navigation', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		const indicator = carousel.locator('cuentoneta-carousel-indicator');
		await expect(indicator).toBeVisible();
	});

	test('should navigate carousel using indicators', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		const indicatorButtons = carousel.locator('cuentoneta-carousel-indicator button');
		const buttonCount = await indicatorButtons.count();

		if (buttonCount > 1) {
			// Get the second indicator button
			const secondIndicator = indicatorButtons.nth(1);

			// Click second indicator
			await secondIndicator.click();

			// Wait for the second indicator to become active (deterministic wait for state change)
			// Uses aria-current attribute which indicates the active slide
			await expect(secondIndicator).toHaveAttribute('aria-current', 'true', { timeout: 2000 });

			// Verify the carousel navigated (active slide changed)
			const activeSlide = carousel.locator('.slide.active');
			await expect(activeSlide).toBeVisible();
		}
	});

	test('should have clickable campaign slides', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		const links = carousel.locator('.slide.active a');
		if ((await links.count()) > 0) {
			const firstLink = links.first();
			await expect(firstLink).toHaveAttribute('href', /.+/);
		}
	});

	test('carousel should have correct section aspect ratio', async ({ page }) => {
		const section = page.locator('main > section').first();
		await expect(section).toBeVisible();

		// Check for responsive aspect ratio classes
		const className = await section.getAttribute('class');
		expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_MOBILE);
		expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_DESKTOP);
	});
});
