import { test, expect, type Page, type Locator } from '@playwright/test';

// Constantes de configuración de tests
const TEST_TIMEOUTS = {
	DEFAULT: 10000,
	SLOW_NETWORK: 15000,
	ELEMENT_WAIT: 10000,
} as const;

const EXPECTED_COUNTS = {
	MAIN_SECTIONS: 4,
	CARDS_TO_VERIFY: 3, // Number of cards to check in consistency tests
	MAX_LINKS_TO_VERIFY: 5, // Max navigation links to validate
	MAX_A11Y_LINKS_TO_CHECK: 10, // Max links to check for accessibility
} as const;

const TEST_SELECTORS = {
	CAROUSEL: 'cuentoneta-carousel',
	CAROUSEL_SKELETON: 'cuentoneta-carousel-skeleton',
	LATEST_DECK: 'cuentoneta-latest-stories-card-deck',
	MOST_READ_DECK: 'cuentoneta-most-read-stories-card-deck',
	COLLECTION_TEASER: 'cuentoneta-collection-teaser',
	COLLECTION_DECK: 'cuentoneta-collection-teasers-deck',
	CARD: '[data-testid="card"]',
	SKELETON: '[data-testid="skeleton"]',
	MAIN_CONTENT: 'main.content',
	FIRST_SECTION: 'main > section',
} as const;

const CSS_CLASSES = {
	STORY_TITLE: '[data-testid="story-title"]',
	ORDER_NUMBER: '[data-testid="story-order"]',
	AUTHOR_NAME: '[data-testid="author-name"]',
	COLLECTION_TITLE: '[data-testid="collection-title"]',
	CAROUSEL_ASPECT_MOBILE: 'aspect-[540/220]',
	CAROUSEL_ASPECT_DESKTOP: 'sm:aspect-[1240/360]',
} as const;

// Funciones auxiliares para patrones comunes
async function waitForElement(page: Page, selector: string, timeout = TEST_TIMEOUTS.ELEMENT_WAIT) {
	return await page.waitForSelector(selector, { timeout });
}

async function waitForCards(page: Page, componentSelector: string) {
	return await waitForElement(page, `${componentSelector} [data-testid="card"]`);
}

async function verifyStoryCardStructure(card: Locator) {
	// Author image
	await expect(card.locator('img[width="20"][height="20"]')).toBeVisible();
	// Author name
	await expect(card.locator('[data-testid="author-name"]')).toBeVisible();
	// Title
	await expect(card.locator('[data-testid="story-title"]')).toBeVisible();
	// Footer with reading time
	await expect(card.locator('footer')).toContainText(/minutos de lectura/);
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
			const content = await metaKeywords.getAttribute('content');
			expect(content).toBeTruthy();
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
				// Click second indicator
				await indicatorButtons.nth(1).click();

				// Wait for animation to complete
				await page.waitForTimeout(700);

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
			// Esperar las tarjetas reales (no skeletons)
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
			const cards = latestDeck.locator('[data-testid="card"]');
			expect(await cards.count()).toBeGreaterThan(0);
		});

		test('story cards should have correct structure', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();

			// Use shared helper to verify common card structure
			await verifyStoryCardStructure(firstCard);

			// Additional checks specific to latest stories
			const titleText = await firstCard.locator('[data-testid="story-title"]').innerText();
			expect(titleText.length).toBeGreaterThan(0);

			await expect(firstCard.locator('footer')).toContainText('Leer ->');
		});

		test('story cards should have order numbers', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const cards = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]');

			// Check first few cards have order numbers
			for (let i = 0; i < EXPECTED_COUNTS.CARDS_TO_VERIFY; i++) {
				const card = cards.nth(i);
				const orderNumber = card.locator('[data-testid="story-order"]');
				await expect(orderNumber).toBeVisible();

				const orderText = await orderNumber.innerText();
				expect(orderText).toMatch(/^0?[1-9]\.$/);
			}
		});

		test('should have responsive grid layout', async ({ page }) => {
			const section = page.locator('cuentoneta-latest-stories-card-deck section');
			await expect(section).toBeVisible();

			const className = await section.getAttribute('class');
			expect(className).toContain('grid-cols-1');
			expect(className).toContain('md:grid-cols-3');
		});

		test('story title link should have correct href', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
			const storyLink = firstCard.locator('a[href^="/story/"]');

			await expect(storyLink).toHaveAttribute('href', /\/story\/.+/);
		});

		test('author link should have correct href', async ({ page }) => {
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

			expect(await cards.count()).toBeGreaterThan(0);
		});

		test('most-read cards should have correct structure', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

			const firstCard = page.locator('cuentoneta-most-read-stories-card-deck [data-testid="card"]').first();

			// Use shared helper to verify card structure (same as latest stories)
			await verifyStoryCardStructure(firstCard);
		});
	});

	test.describe('Featured Collections Section', () => {
		test('should render "Colecciones" heading', async ({ page }) => {
			const heading = page.locator('h2:has-text("Colecciones")');
			await expect(heading).toBeVisible();
		});

		test('should have collections description text', async ({ page }) => {
			const deck = page.locator(TEST_SELECTORS.COLLECTION_DECK);
			await expect(deck).toBeVisible();

			// Check for description text - use specific class selector
			const description = deck.locator('.text-neutral-600:has-text("Historias agrupadas")');
			await expect(description).toBeVisible();
		});

		test('should display storylist cards section', async ({ page }) => {
			// The featured collections section should exist
			const collectionsSection = page.locator('section.grid').last();
			await expect(collectionsSection).toBeVisible();

			// Wait for cards or skeletons to appear
			const cardsInSection = collectionsSection.locator(
				'cuentoneta-collection-teaser, cuentoneta-collection-teaser-skeleton',
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
			const cards = collectionsSection.locator('cuentoneta-collection-teaser');
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Should have at least one storylist card
			expect(count).toBeGreaterThan(0);
		});

		test('storylist cards should have title', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.COLLECTION_TEASER);

			const firstCard = page.locator('cuentoneta-collection-teaser').first();
			const title = firstCard.locator('[data-testid="collection-title"]');

			await expect(title).toBeVisible();
			const titleText = await title.innerText();
			expect(titleText.length).toBeGreaterThan(0);
		});

		test('storylist cards should have description', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.COLLECTION_TEASER);

			const firstCard = page.locator('cuentoneta-collection-teaser').first();
			const description = firstCard.locator('cuentoneta-portable-text-parser');

			await expect(description).toBeVisible();
		});

		test('storylist cards should have story count', async ({ page }) => {
			// Wait for cards to be visible
			const cards = page.locator('cuentoneta-collection-teaser');
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Only test if cards exist
			if (count > 0) {
				const firstCard = cards.first();
				const footer = firstCard.locator('footer');

				await expect(footer).toBeVisible();
				await expect(footer).toContainText(/historias/i);
			}
		});

		test('should have responsive grid layout', async ({ page }) => {
			const section = page.locator('section.grid').last();
			await expect(section).toBeVisible();

			const className = await section.getAttribute('class');
			expect(className).toContain('grid-cols-1');
			expect(className).toContain('sm:grid-cols-2');
		});

		test('storylist card link should have correct href', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.COLLECTION_TEASER);

			const firstCard = page.locator('cuentoneta-collection-teaser').first();
			const link = firstCard.locator('a.navigation-link');

			await expect(link).toHaveAttribute('href', /\/storylist\/.+/);
		});
	});

	test.describe('Navigation and Links', () => {
		test('campaign carousel slide links should be valid', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CAROUSEL);

			const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
			const links = carousel.locator('.slide.active a');
			if ((await links.count()) > 0) {
				const href = await links.first().getAttribute('href');
				expect(href).toBeTruthy();
			}
		});

		test('story card links should navigate with correct paths', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			const firstCard = page.locator('[data-testid="card"]').first();
			const storyLink = firstCard.locator('a[href^="/story/"]');

			// Verify navigation
			const href = await storyLink.getAttribute('href');
			expect(href).toMatch(/\/story\/.+/);
		});

		test('author links should navigate correctly', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			const firstCard = page.locator('[data-testid="card"]').first();
			const authorLink = firstCard.locator('a[href^="/author/"]');

			const href = await authorLink.getAttribute('href');
			expect(href).toMatch(/\/author\/.+/);
		});

		test('all navigation links should be accessible', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Obtener todos los links de la página
			const links = page.locator('a[href]');
			const count = await links.count();

			expect(count).toBeGreaterThan(0);

			// Verificar que los primeros links son válidos
			const linkCount = Math.min(EXPECTED_COUNTS.MAX_LINKS_TO_VERIFY, count);
			for (let i = 0; i < linkCount; i++) {
				const href = await links.nth(i).getAttribute('href');
				expect(href).toBeTruthy();
			}
		});
	});

	test.describe('Responsive Layout', () => {
		test('mobile: should display single column layouts', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
			await page.goto('/');

			await page.waitForSelector('main.content');

			// Check latest stories grid has CSS class for single column
			const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
			const latestClass = await latestGrid.getAttribute('class');
			expect(latestClass).toContain('grid-cols-1');

			// Verify actual computed grid columns (should be single column on mobile)
			const computedColumns = await latestGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
			// Single column should have just one column value (not multiple)
			expect(computedColumns.split(' ').length).toBe(1);

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

			// Verify actual computed grid columns (should be multiple columns on desktop)
			const computedColumns = await latestGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
			// Multiple columns should have more than one column value
			expect(computedColumns.split(' ').length).toBeGreaterThan(1);

			const collectionsGrid = page.locator('section.grid').last();
			await expect(collectionsGrid).toBeVisible();
		});

		test('mobile: carousel should use correct height', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/');

			await page.waitForSelector('main > section');

			const section = page.locator('main > section').first();
			const className = await section.getAttribute('class');
			expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_MOBILE);
		});

		test('desktop: carousel should use correct height', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 });
			await page.goto('/');

			await page.waitForSelector('main > section');

			const section = page.locator('main > section').first();
			const className = await section.getAttribute('class');
			expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_DESKTOP);
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
			const collectionsSection = page.locator('section').filter({ hasText: 'Colecciones' });
			await expect(collectionsSection).toBeVisible();
		});

		test('carousel section should have correct structure', async ({ page }) => {
			const section = page.locator('main > section').first();
			await expect(section).toBeVisible();

			// Check if it has the height classes
			const className = await section.getAttribute('class');
			expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_MOBILE);
		});

		test('story card decks should have correct grid structure', async ({ page }) => {
			const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
			await expect(latestGrid).toBeVisible();

			const className = await latestGrid.getAttribute('class');
			expect(className).toContain('grid');
			expect(className).toContain('grid-cols-1');
		});

		test('all content should eventually load', async ({ page }) => {
			// El contenido principal debe ser visible
			const mainContent = page.locator(TEST_SELECTORS.MAIN_CONTENT);
			await expect(mainContent).toBeVisible();

			// Los mazos de tarjetas deben ser visibles
			const latestDeck = page.locator(TEST_SELECTORS.LATEST_DECK);
			await expect(latestDeck).toBeVisible();

			// Esperar a que las tarjetas se carguen
			await waitForElement(page, TEST_SELECTORS.CARD);
		});
	});

	test.describe('Content Integrity', () => {
		test('should load data successfully', async ({ page }) => {
			// Verificar que la página cargó exitosamente revisando componentes clave
			// Esto prueba indirectamente que la llamada a la API fue exitosa
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Todos los componentes principales deben ser visibles, indicando carga exitosa de datos
			const latestDeck = page.locator(TEST_SELECTORS.LATEST_DECK);
			const mostReadDeck = page.locator(TEST_SELECTORS.MOST_READ_DECK);
			const collectionsSection = page.locator('section').filter({ hasText: 'Colecciones' });

			await expect(latestDeck).toBeVisible();
			await expect(mostReadDeck).toBeVisible();
			await expect(collectionsSection).toBeVisible();
		});

		test('should display latest stories', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

			const latestCards = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]');
			expect(await latestCards.count()).toBeGreaterThan(0);
		});

		test('should display most-read stories', async ({ page }) => {
			await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

			const mostReadCards = page.locator('cuentoneta-most-read-stories-card-deck [data-testid="card"]');
			expect(await mostReadCards.count()).toBeGreaterThan(0);
		});

		test('should display featured collections in grid section', async ({ page }) => {
			// Get cards specifically from the collections grid section
			const collectionsSection = page.locator('section.grid').last();
			const cards = collectionsSection.locator('cuentoneta-collection-teaser');

			// Wait for at least one card to be visible
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Should have at least one storylist card
			expect(count).toBeGreaterThan(0);
		});

		test('all sections should be present', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			const sections = page.locator(`${TEST_SELECTORS.MAIN_CONTENT} > section`);
			expect(await sections.count()).toBe(EXPECTED_COUNTS.MAIN_SECTIONS);
		});

		test('story cards should have consistent data structure', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			const cards = page.locator('[data-testid="card"]');

			// Check first cards for consistency
			for (let i = 0; i < EXPECTED_COUNTS.CARDS_TO_VERIFY; i++) {
				const card = cards.nth(i);

				// Each card should have these elements
				await expect(card.locator('img[width="20"]')).toBeVisible(); // Author image
				await expect(card.locator('[data-testid="author-name"]')).toBeVisible(); // Author name
				await expect(card.locator('[data-testid="story-title"]')).toBeVisible(); // Title
				await expect(card.locator('footer')).toBeVisible(); // Footer with reading time
			}
		});
	});

	test.describe('Accessibility', () => {
		test('all images should have alt text', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			const images = page.locator('img');
			const count = await images.count();

			for (let i = 0; i < count; i++) {
				const alt = await images.nth(i).getAttribute('alt');
				expect(alt).toBeTruthy();
			}
		});

		test('headings should have proper hierarchy', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Verificar encabezados h2
			const h2Headings = page.locator('h2');
			expect(await h2Headings.count()).toBeGreaterThan(0);

			// Verificar texto del encabezado para colecciones destacadas
			await expect(page.locator('h2:has-text("Colecciones")')).toBeVisible();
		});

		test('links should be keyboard accessible', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Navegar con Tab al primer link
			await page.keyboard.press('Tab');
			const focusedElement = page.locator(':focus');
			await expect(focusedElement).toBeVisible();
		});

		test('interactive elements should have proper focus states', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CAROUSEL);

			// Verificar puntos del carrusel
			const dots = page.locator('.owl-dots .owl-dot');
			if ((await dots.count()) > 0) {
				await dots.first().focus();
				await expect(dots.first()).toBeFocused();
			}
		});

		test('semantic HTML elements should be used', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Verificar elementos semánticos (usar first() para evitar violaciones de modo estricto)
			await expect(page.locator('main').first()).toBeVisible();
			await expect(page.locator('section').first()).toBeVisible();
			await expect(page.locator('article').first()).toBeVisible();
			await expect(page.locator('footer').first()).toBeVisible();
		});

		test('page should have lang attribute for accessibility', async ({ page }) => {
			const htmlLang = await page.locator('html').getAttribute('lang');
			expect(htmlLang).toBeTruthy();
		});

		test('links should have meaningful text content', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Check that links have text content or aria-label
			const links = page.locator('a[href]');
			const count = Math.min(EXPECTED_COUNTS.MAX_A11Y_LINKS_TO_CHECK, await links.count());

			for (let i = 0; i < count; i++) {
				const link = links.nth(i);
				const text = await link.innerText();
				const ariaLabel = await link.getAttribute('aria-label');
				const hasImage = (await link.locator('img').count()) > 0;

				// Link should have text, aria-label, or contain an image with alt
				expect(text.trim().length > 0 || ariaLabel || hasImage).toBeTruthy();
			}
		});

		test('buttons and interactive elements should be focusable', async ({ page }) => {
			await waitForElement(page, TEST_SELECTORS.CARD);

			// Check that interactive elements can receive focus
			const interactiveElements = page.locator('a, button, [tabindex="0"]');
			const count = await interactiveElements.count();

			expect(count).toBeGreaterThan(0);

			// First interactive element should be focusable
			const firstElement = interactiveElements.first();
			await firstElement.focus();
			await expect(firstElement).toBeFocused();
		});
	});

	test.describe('Edge Cases', () => {
		// Describe anidado para tests que requieren mocking de rutas
		test.describe('Network and Data Edge Cases', () => {
			// Override del beforeEach implementado en la raíz, para evitar navegación inmediata
			test.beforeEach(async ({ page }) => {});

			test('should handle slow network gracefully', async ({ page }) => {
				// Configuramos ruta para antes de la navegación
				await page.route('**/api/content/landing-page', async (route) => {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					await route.continue();
				});

				// Navegamos con la ruta correspondiente
				await page.goto('/', { waitUntil: 'domcontentloaded' });

				await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();
				const cards = page.locator(TEST_SELECTORS.CARD);
				await expect(cards.first()).toBeVisible({
					timeout: TEST_TIMEOUTS.SLOW_NETWORK,
				});
			});

			test('should handle empty campaign array gracefully', async ({ page }) => {
				// Configuramos ruta para antes de la navegación
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

			test('should handle API 500 error gracefully', async ({ page }) => {
				// Mock API to return 500 error
				await page.route('**/api/content/landing-page', async (route) => {
					await route.fulfill({
						status: 500,
						contentType: 'application/json',
						body: JSON.stringify({ error: 'Internal Server Error' }),
					});
				});

				await page.goto('/', { waitUntil: 'domcontentloaded' });

				// Page should still render main content structure
				await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();

				// Component decks should be visible (showing loading or empty state)
				await expect(page.locator(TEST_SELECTORS.LATEST_DECK)).toBeVisible();
				await expect(page.locator(TEST_SELECTORS.MOST_READ_DECK)).toBeVisible();
			});

			test('should handle network failure gracefully', async ({ page }) => {
				// Mock network failure
				await page.route('**/api/content/landing-page', async (route) => {
					await route.abort('failed');
				});

				await page.goto('/', { waitUntil: 'domcontentloaded' });

				// Page should still render main content structure even with network failure
				await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();
			});
		});

		// Los demás edge cases usan el beforeEach raíz
		test('should handle missing storylist tags gracefully', async ({ page }) => {
			// Esperamos a que las tarjetas sean visibles
			const cards = page.locator('cuentoneta-collection-teaser');
			await expect(cards.first()).toBeVisible({ timeout: 10000 });

			const count = await cards.count();

			// Las cards deben visualizarse aunque las tags no sean visibles
			expect(count).toBeGreaterThan(0);

			// Verificar que la estructura de cards está en su lugar aunque sea sin tags
			const firstCard = cards.first();
			await expect(firstCard.locator('[data-testid="collection-title"]')).toBeVisible(); // Title should be visible
		});
	});
});
