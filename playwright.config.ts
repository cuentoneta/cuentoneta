import { defineConfig, devices } from '@playwright/test';

// For CI, you may want to set BASE_URL to the deployed application.
// El default es el server SSR de producción (`src/server.ts`, puerto 4000), no el dev-server: los
// tests de SEO ejercen el HTML crudo que ve el crawler y necesitan la fidelidad del build de prod
// (comportamiento real de `@defer`, deopt por proxy headers) que el dev-server no reproduce.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4000';

const isCI = !!process.env['CI'];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',
	outputDir: 'dist/.playwright/test-output',
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	// `list` lista cada test en el log de CI; el `html` solo informa en consola dónde dejó el reporte que el
	// job sube como artefacto.
	reporter: [['list'], ['html', { outputFolder: 'dist/.playwright/playwright-report', open: 'on-failure' }]],
	// El loader de Playwright transpila los specs por su cuenta y no aplica los `paths` del tsconfig
	// sin esta opción explícita: la declara para resolver los aliases del repo (p. ej. @testing) en runtime.
	tsconfig: './tsconfig.json',
	// e2e/_utils aloja el core puro y su spec de Vitest (no de Playwright); se excluye del testMatch
	// para que Playwright no intente correrlo (usa los globals de Vitest, no test/expect de Playwright).
	testIgnore: '**/e2e/_utils/**',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		baseURL,
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
	},
	/* Levanta el server SSR de producción ya buildeado. Requiere un build previo (`pnpm build` local,
	   o el paso de build del job `e2e` en CI): este comando solo arranca el server, no compila. */
	webServer: {
		command: 'node dist/cuentoneta/server/server.mjs',
		url: 'http://localhost:4000',
		reuseExistingServer: !isCI,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
	],
});
