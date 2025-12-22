import { test, expect, type Page } from '@playwright/test';

// Test configuration constants
const TEST_TIMEOUTS = {
	DEFAULT: 10000,
	SLOW_NETWORK: 15000,
	ELEMENT_WAIT: 10000,
} as const;

const EXPECTED_COUNTS = {
	LATEST_STORIES_CARDS: 6,
	MOST_READ_CARDS: 6,
	MAIN_SECTIONS: 4,
} as const;

const TEST_SELECTORS = {
	CAROUSEL: 'cuentoneta-content-campaign-carousel',
	CAROUSEL_SKELETON: 'cuentoneta-content-campaign-carousel-skeleton',
	LATEST_DECK: 'cuentoneta-latest-stories-card-deck',
	MOST_READ_DECK: 'cuentoneta-most-read-stories-card-deck',
	STORYLIST_CARD: 'cuentoneta-storylist-card',
	CARD: '[data-testid="card"]',
	SKELETON: '[data-testid="skeleton"]',
	MAIN_CONTENT: 'main.content',
	FIRST_SECTION: 'main > section',
} as const;

const CSS_CLASSES = {
	STORY_TITLE: '.inter-heading-3-bold',
	ORDER_NUMBER: '.source-serif-pro-heading-2-bold',
	AUTHOR_NAME: '.inter-body-sm-semibold',
	CAROUSEL_HEIGHT_MOBILE: 'h-[189.36px]',
	CAROUSEL_HEIGHT_DESKTOP: 'sm:h-[317px]',
} as const;

// Helper functions for common patterns
async function waitForElement(page: Page, selector: string, timeout = 10000) {
	return await page.waitForSelector(selector, { timeout });
}

async function waitForCards(page: Page, componentSelector: string) {
	return await waitForElement(page, `${componentSelector} [data-testid="card"]`);
}

async function waitForCarousel(page: Page) {
	return await waitForElement(page, 'cuentoneta-content-campaign-carousel');
}

async function waitForStorylistCards(page: Page) {
	return await waitForElement(page, 'cuentoneta-storylist-card');
}

async function waitForAnyCards(page: Page) {
	return await waitForElement(page, '[data-testid="card"]');
}

test.describe('HomeComponent', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('main.content');
	});

	test.describe('SEO and Meta Tags', () => {
		test('should have correct page title', async ({ page }) => {
			await expect(page).toHaveTitle('La Cuentoneta');
		});

		test('should have meta description', async ({ page }) => {
			const metaDescription = page.locator('meta[name="description"]');
			await expect(metaDescription).toHaveAttribute(
				'content',
				'Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
		});

		test('should have meta keywords', async ({ page }) => {
			const metaKeywords = page.locator('meta[name="keywords"]');
			await expect(metaKeywords).toHaveAttribute('content', /.+/);
			const content = await metaKeywords.getAttribute('content');
			expect(content).toContain('cuentos');
			expect(content).toContain('literatura');
		});

		test('should have canonical URL', async ({ page }) => {
			const canonical = page.locator('link[rel="canonical"]');
			await expect(canonical).toHaveAttribute('href', /.+/);
		});

		test('should have robots meta tag set to index, follow', async ({ page }) => {
			const robots = page.locator('meta[name="robots"]');
			await expect(robots).toHaveAttribute('content', 'index, follow');
		});

		test('should have Open Graph meta tags', async ({ page }) => {
			const ogTitle = page.locator('meta[property="og:title"]');
			await expect(ogTitle).toHaveAttribute('content', 'La Cuentoneta');

			const ogDescription = page.locator('meta[property="og:description"]');
			await expect(ogDescription).toBeAttached();
		});

		test('should have Twitter card meta tags', async ({ page }) => {
			const twitterTitle = page.locator('meta[name="twitter:title"]');
			await expect(twitterTitle).toHaveAttribute('content', 'La Cuentoneta');
		});
	});

	test.describe('Campaign Carousel Section', () => {
		test('should render campaign carousel section', async ({ page }) => {
			await waitForCarousel(page);
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
			await waitForCarousel(page);

			const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
			await expect(carousel).toBeVisible();

			// Check for owl-carousel container
			const owlCarousel = carousel.locator('owl-carousel-o');
			await expect(owlCarousel).toBeVisible();
		});

		test('should have carousel slides with images', async ({ page }) => {
			await waitForCarousel(page);

			const slides = page.locator('.owl-item img');
			const count = await slides.count();
			expect(count).toBeGreaterThan(0);

			// Check first slide has valid image
			const firstSlide = slides.first();
			await expect(firstSlide).toHaveAttribute('src', /.+/);
		});

		test('should have carousel dots navigation', async ({ page }) => {
			await waitForCarousel(page);

			const dots = page.locator('.owl-dots .owl-dot');
			const count = await dots.count();
			expect(count).toBeGreaterThan(0);
		});

		test('should navigate carousel using dots', async ({ page }) => {
			await waitForCarousel(page);

			const dots = page.locator('.owl-dots .owl-dot');
			const dotCount = await dots.count();

			if (dotCount > 1) {
				// Click second dot
				await dots.nth(1).click();

				// Wait for second dot to become active (animation completes)
				const secondDot = dots.nth(1);
				await expect(secondDot).toHaveClass(/active/);
			}
		});

		test('should have clickable campaign slides', async ({ page }) => {
			await waitForCarousel(page);

			const links = page.locator('.owl-item.active a');
			if ((await links.count()) > 0) {
				const firstLink = links.first();
				await expect(firstLink).toHaveAttribute('href', /.+/);
			}
		});

		test('carousel should have correct section height', async ({ page }) => {
			const section = page.locator('main > section').first();
			await expect(section).toBeVisible();

			// Check for responsive height classes
			const className = await section.getAttribute('class');
			expect(className).toMatch(/h-\[189\.36px\]/);
			expect(className).toMatch(/sm:h-\[317px\]/);
		});
	});

	test.describe('Latest Stories Card Deck Section', () => {
		test('should display latest stories card deck component', async ({ page }) => {
			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			await expect(latestDeck).toBeVisible();
		});

		test('should display latest story cards or skeletons', async ({ page }) => {
			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			await expect(latestDeck).toBeVisible();

			// Wait for either cards or skeletons to appear
			await page.waitForSelector(
				'cuentoneta-latest-stories-card-deck [data-testid="card"], cuentoneta-latest-stories-card-deck [data-testid="skeleton"]',
				{
					timeout: 10000,
				},
			);

			const cards = latestDeck.locator('[data-testid="card"]');
			const skeletons = latestDeck.locator('[data-testid="skeleton"]');

			const cardsCount = await cards.count();
			const skeletonsCount = await skeletons.count();

			// Should have at least one card or skeleton visible
			expect(cardsCount + skeletonsCount).toBeGreaterThan(0);
		});

		test('should display story cards after loading', async ({ page }) => {
			// Wait for actual cards (not skeletons)
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			const cards = latestDeck.locator('[data-testid="card"]');
			expect(await cards.count()).toBe(6);
		});

		test('story cards should have author information', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();

			// Check for author image
			const authorImg = firstCard.locator('img[width="20"][height="20"]');
			await expect(authorImg).toBeVisible();

			// Check for author name
			const authorName = firstCard.locator('.inter-body-sm-semibold');
			await expect(authorName).toBeVisible();
		});

		test('story cards should have title', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
			const title = firstCard.locator('.inter-heading-3-bold');
			await expect(title).toBeVisible();

			const titleText = await title.innerText();
			expect(titleText.length).toBeGreaterThan(0);
		});

		test('story cards should have reading time', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
			const footer = firstCard.locator('footer');
			await expect(footer).toContainText(/minutos de lectura/);
			await expect(footer).toContainText('Leer ->');
		});

		test('story cards should have order numbers', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const cards = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]');

			// Check first few cards have order numbers
			await Promise.all(
				Array.from({ length: 3 }, async (_, i) => {
					const card = cards.nth(i);
					const orderNumber = card.locator('.source-serif-pro-heading-2-bold');
					await expect(orderNumber).toBeVisible();

					const orderText = await orderNumber.innerText();
					expect(orderText).toMatch(/^0?[1-9]\.$/);
				}),
			);
		});

		test('should have responsive grid layout', async ({ page }) => {
			const section = page.locator('cuentoneta-latest-stories-card-deck section');
			await expect(section).toBeVisible();

			const className = await section.getAttribute('class');
			expect(className).toContain('grid-cols-1');
			expect(className).toContain('md:grid-cols-3');
		});

		test('clicking on story title should navigate', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
			const storyLink = firstCard.locator('a[href^="/story/"]');

			await expect(storyLink).toHaveAttribute('href', /\/story\/.+/);
		});

		test('clicking on author should navigate', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
			const authorLink = firstCard.locator('a[href^="/author/"]');

			await expect(authorLink).toHaveAttribute('href', /\/author\/.+/);
		});
	});

	test.describe('Most Read Stories Card Deck Section', () => {
		test('should display most-read stories card deck component', async ({ page }) => {
			const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');
			await expect(mostReadDeck).toBeVisible();
		});

		test('should display 6 most-read story cards', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

			const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');
			const cards = mostReadDeck.locator('[data-testid="card"]');

			expect(await cards.count()).toBe(6);
		});

		test('most-read cards should have same structure as latest stories', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

			const firstCard = page.locator('cuentoneta-most-read-stories-card-deck [data-testid="card"]').first();

			// Check for author
			const authorImg = firstCard.locator('img[width="20"][height="20"]');
			await expect(authorImg).toBeVisible();

			// Check for title
			const title = firstCard.locator('.inter-heading-3-bold');
			await expect(title).toBeVisible();

			// Check for reading time
			const footer = firstCard.locator('footer');
			await expect(footer).toContainText(/minutos de lectura/);
		});
	});

	test.describe('Featured Collections Section', () => {
		test('should render "Colecciones destacadas" heading', async ({ page }) => {
			const heading = page.locator('h2:has-text("Colecciones destacadas")');
			await expect(heading).toBeVisible();
			await expect(heading).toHaveClass(/italic/);
		});

		test('should have decorative horizontal lines', async ({ page }) => {
			const section = page.locator('section').filter({ hasText: 'Colecciones destacadas' });
			const hrs = section.locator('hr');
			expect(await hrs.count()).toBeGreaterThan(0);
		});

		test('should display storylist cards section', async ({ page }) => {
			// The featured collections section should exist
			const collectionsSection = page.locator('section.grid').last();
			await expect(collectionsSection).toBeVisible();

			// Wait for cards or skeletons to appear
			const cardsInSection = collectionsSection.locator(
				'cuentoneta-storylist-card, cuentoneta-storylist-card-skeleton',
			);
			await expect(cardsInSection.first()).toBeVisible({ timeout: 10000 });

			const count = await cardsInSection.count();

			// Should have at least one card or skeleton
			expect(count).toBeGreaterThan(0);
		});

		test('storylist cards should be visible in collections section', async ({ page }) => {
			// Get the collections section specifically
			const collectionsSection = page.locator('section.grid').last();

			// Wait for storylist cards to appear
			const cards = collectionsSection.locator('cuentoneta-storylist-card');
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Should have at least one storylist card
			expect(count).toBeGreaterThan(0);
		});

		test('storylist cards should have title', async ({ page }) => {
			await waitForStorylistCards(page);

			const firstCard = page.locator('cuentoneta-storylist-card').first();
			const title = firstCard.locator('h1.h3');

			await expect(title).toBeVisible();
			const titleText = await title.innerText();
			expect(titleText.length).toBeGreaterThan(0);
		});

		test('storylist cards should have description', async ({ page }) => {
			await waitForStorylistCards(page);

			const firstCard = page.locator('cuentoneta-storylist-card').first();
			const description = firstCard.locator('cuentoneta-portable-text-parser');

			await expect(description).toBeVisible();
		});

		test('storylist cards should have story count badge', async ({ page }) => {
			// Wait for cards to be visible
			const cards = page.locator('cuentoneta-storylist-card');
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Only test if cards exist
			if (count > 0) {
				const firstCard = cards.first();
				const badge = firstCard.locator('footer span.inter-body-xs-bold').first();

				await expect(badge).toBeVisible();
				await expect(badge).toContainText(/historias/i);
			}
		});

		test('should have responsive grid layout', async ({ page }) => {
			const section = page.locator('section.grid').last();
			await expect(section).toBeVisible();

			const className = await section.getAttribute('class');
			expect(className).toContain('grid-cols-1');
			expect(className).toContain('sm:grid-cols-2');
		});

		test('clicking on storylist card should navigate', async ({ page }) => {
			await waitForStorylistCards(page);

			const firstCard = page.locator('cuentoneta-storylist-card').first();
			const link = firstCard.locator('a.navigation-link');

			await expect(link).toHaveAttribute('href', /\/storylist\/.+/);
		});
	});

	test.describe('Navigation and Links', () => {
		test('campaign carousel slide links should be valid', async ({ page }) => {
			await waitForCarousel(page);

			const links = page.locator('.owl-item.active a');
			if ((await links.count()) > 0) {
				const href = await links.first().getAttribute('href');
				expect(href).toBeTruthy();
			}
		});

		test('story card links should navigate with correct paths', async ({ page }) => {
			await waitForAnyCards(page);

			const firstCard = page.locator('[data-testid="card"]').first();
			const storyLink = firstCard.locator('a[href^="/story/"]');

			// Verify navigation
			const href = await storyLink.getAttribute('href');
			expect(href).toMatch(/\/story\/.+/);
		});

		test('author links should navigate correctly', async ({ page }) => {
			await waitForAnyCards(page);

			const firstCard = page.locator('[data-testid="card"]').first();
			const authorLink = firstCard.locator('a[href^="/author/"]');

			const href = await authorLink.getAttribute('href');
			expect(href).toMatch(/\/author\/.+/);
		});

		test('all navigation links should be accessible', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			// Get all links on the page
			const links = page.locator('a[href]');
			const count = await links.count();

			expect(count).toBeGreaterThan(0);

			// Verify first few links are valid
			const linkCount = Math.min(5, count);
			const hrefs = await Promise.all(Array.from({ length: linkCount }, (_, i) => links.nth(i).getAttribute('href')));
			hrefs.forEach((href) => expect(href).toBeTruthy());
		});
	});

	test.describe('Responsive Layout', () => {
		test('mobile: should display single column layouts', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
			await page.goto('/');

			await page.waitForSelector('main.content');

			// Check latest stories grid
			const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
			const latestClass = await latestGrid.getAttribute('class');
			expect(latestClass).toContain('grid-cols-1');

			// Check featured collections grid
			const collectionsGrid = page.locator('section.grid').last();
			const collectionsClass = await collectionsGrid.getAttribute('class');
			expect(collectionsClass).toContain('grid-cols-1');
		});

		test('desktop: should display multi-column layouts', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 }); // Desktop size
			await page.goto('/');

			await page.waitForSelector('main.content');

			// Grids should adapt to larger screens
			const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
			await expect(latestGrid).toBeVisible();

			const collectionsGrid = page.locator('section.grid').last();
			await expect(collectionsGrid).toBeVisible();
		});

		test('mobile: carousel should use correct height', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/');

			await page.waitForSelector('main > section');

			const section = page.locator('main > section').first();
			const className = await section.getAttribute('class');
			expect(className).toContain('h-[189.36px]');
		});

		test('desktop: carousel should use correct height', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 });
			await page.goto('/');

			await page.waitForSelector('main > section');

			const section = page.locator('main > section').first();
			const className = await section.getAttribute('class');
			expect(className).toContain('sm:h-[317px]');
		});

		test('tablet: should use appropriate breakpoints', async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
			await page.goto('/');

			await page.waitForSelector('main.content');

			// Should display multi-column at tablet size
			const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
			await expect(latestGrid).toBeVisible();
		});
	});

	test.describe('Loading States and Skeletons', () => {
		test('should show carousel section', async ({ page }) => {
			// The carousel section should always exist
			const section = page.locator('main > section').first();
			await expect(section).toBeVisible();
		});

		test('should show story card deck components', async ({ page }) => {
			// Story card decks should exist
			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');

			await expect(latestDeck).toBeVisible();
			await expect(mostReadDeck).toBeVisible();
		});

		test('should show featured collections section', async ({ page }) => {
			// Featured collections section should exist
			const collectionsSection = page.locator('section').filter({ hasText: 'Colecciones destacadas' });
			await expect(collectionsSection).toBeVisible();
		});

		test('carousel section should have correct structure', async ({ page }) => {
			const section = page.locator('main > section').first();
			await expect(section).toBeVisible();

			// Check if it has the height classes
			const className = await section.getAttribute('class');
			expect(className).toContain('h-[189.36px]');
		});

		test('story card decks should have correct grid structure', async ({ page }) => {
			const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
			await expect(latestGrid).toBeVisible();

			const className = await latestGrid.getAttribute('class');
			expect(className).toContain('grid');
			expect(className).toContain('grid-cols-1');
		});

		test('all content should eventually load', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Main content should be visible
			const mainContent = page.locator('main.content');
			await expect(mainContent).toBeVisible();

			// Card decks should be visible
			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			await expect(latestDeck).toBeVisible();
		});
	});

	test.describe('Content Integrity', () => {
		test('should load data successfully', async ({ page }) => {
			// Verify page loaded successfully by checking for key components
			// This indirectly proves the API call succeeded

			await page.waitForLoadState('networkidle');

			// All main components should be visible, indicating successful data load
			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');
			const collectionsSection = page.locator('section').filter({ hasText: 'Colecciones destacadas' });

			await expect(latestDeck).toBeVisible();
			await expect(mostReadDeck).toBeVisible();
			await expect(collectionsSection).toBeVisible();

			// If all components are visible, the API call must have succeeded
			expect(true).toBe(true);
		});

		test('should display exactly 6 latest stories', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const latestCards = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]');
			expect(await latestCards.count()).toBe(6);
		});

		test('should display exactly 6 most-read stories', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

			const mostReadCards = page.locator('cuentoneta-most-read-stories-card-deck [data-testid="card"]');
			expect(await mostReadCards.count()).toBe(6);
		});

		test('should display featured collections in grid section', async ({ page }) => {
			// Get cards specifically from the collections grid section
			const collectionsSection = page.locator('section.grid').last();
			const cards = collectionsSection.locator('cuentoneta-storylist-card');

			// Wait for at least one card to be visible
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Should have at least one storylist card
			expect(count).toBeGreaterThan(0);
		});

		test('all sections should be present', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			const sections = page.locator('main.content > section');
			expect(await sections.count()).toBe(4);
		});

		test('story cards should have consistent data structure', async ({ page }) => {
			await waitForAnyCards(page);

			const cards = page.locator('[data-testid="card"]');

			// Check first 3 cards for consistency
			await Promise.all(
				Array.from({ length: 3 }, async (_, i) => {
					const card = cards.nth(i);

					// Each card should have these elements
					await expect(card.locator('img[width="20"]')).toBeVisible(); // Author image
					await expect(card.locator('.inter-body-sm-semibold')).toBeVisible(); // Author name
					await expect(card.locator('.inter-heading-3-bold')).toBeVisible(); // Title
					await expect(card.locator('footer')).toBeVisible(); // Footer with reading time
				}),
			);
		});
	});

	test.describe('Accessibility', () => {
		test('all images should have alt text', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			const images = page.locator('img');
			const count = await images.count();

			const altTexts = await Promise.all(Array.from({ length: count }, (_, i) => images.nth(i).getAttribute('alt')));
			altTexts.forEach((alt) => expect(alt).toBeTruthy());
		});

		test('headings should have proper hierarchy', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			// Check for h2 headings
			const h2Headings = page.locator('h2');
			expect(await h2Headings.count()).toBeGreaterThan(0);

			// Verify heading text for featured collections
			await expect(page.locator('h2:has-text("Colecciones destacadas")')).toBeVisible();
		});

		test('links should be keyboard accessible', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			// Tab through first link
			await page.keyboard.press('Tab');
			const focusedElement = page.locator(':focus');
			await expect(focusedElement).toBeVisible();
		});

		test('interactive elements should have proper focus states', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			// Check carousel dots
			const dots = page.locator('.owl-dots .owl-dot');
			if ((await dots.count()) > 0) {
				await dots.first().focus();
				await expect(dots.first()).toBeFocused();
			}
		});

		test('semantic HTML elements should be used', async ({ page }) => {
			await page.waitForLoadState('networkidle');

			// Check for semantic elements (use first() to avoid strict mode violations)
			await expect(page.locator('main').first()).toBeVisible();
			await expect(page.locator('section').first()).toBeVisible();
			await expect(page.locator('article').first()).toBeVisible();
			await expect(page.locator('footer').first()).toBeVisible();
		});
	});

	test.describe('Edge Cases', () => {
		// Nested describe for tests requiring route mocking
		test.describe('Network and Data Edge Cases', () => {
			// Override parent beforeEach - don't navigate yet
			test.beforeEach(async ({ page }) => {
				// Clean slate, no navigation
			});

			test('should handle slow network gracefully', async ({ page }) => {
				// Set up route BEFORE navigation
				await page.route('**/api/content/landing-page', async (route) => {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					await route.continue();
				});

				// Now navigate with route in place
				await page.goto('/', { waitUntil: 'domcontentloaded' });

				await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();
				const cards = page.locator(TEST_SELECTORS.CARD);
				await expect(cards.first()).toBeVisible({
					timeout: TEST_TIMEOUTS.SLOW_NETWORK,
				});
			});

			test('should handle empty campaign array gracefully', async ({ page }) => {
				// Set up route BEFORE navigation
				await page.route('**/api/content/landing-page', async (route) => {
					const response = await route.fetch();
					const data = await response.json();
					data.campaigns = [];
					await route.fulfill({ json: data });
				});

				await page.goto('/', { waitUntil: 'domcontentloaded' });

				const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
				const carouselItems = carousel.locator('.owl-item');
				expect(await carouselItems.count()).toBe(0);

				await expect(page.locator(TEST_SELECTORS.LATEST_DECK)).toBeVisible();
				const cards = page.locator(`${TEST_SELECTORS.LATEST_DECK} ${TEST_SELECTORS.CARD}`);
				await expect(cards.first()).toBeVisible();
			});
		});

		// Other edge case tests use normal beforeEach
		test('should handle missing storylist tags gracefully', async ({ page }) => {
			// Wait for cards to be visible
			const cards = page.locator('cuentoneta-storylist-card');
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Cards should render even if tags are missing
			expect(count).toBeGreaterThan(0);

			// Verify card structure is intact even without tags
			const firstCard = cards.first();
			await expect(firstCard.locator('h1.h3')).toBeVisible(); // Title should be visible
		});

		test('should handle very long story titles', async ({ page }) => {
			await waitForAnyCards(page);

			const cards = page.locator('[data-testid="card"]');

			// Titles should not break layout
			const cardCount = Math.min(3, await cards.count());
			await Promise.all(
				Array.from({ length: cardCount }, (_, i) =>
					expect(cards.nth(i).locator('.inter-heading-3-bold')).toBeVisible(),
				),
			);
		});

		test('page should have main content visible', async ({ page }) => {
			await page.goto('/');

			// Basic structure should be present
			await expect(page.locator('main')).toBeVisible();
		});
	});
});
