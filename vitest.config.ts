/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Configuración de Vitest para Angular zoneless (Nx 23 + builder vite/esbuild).
// El plugin de Analog compila componentes/plantillas Angular en modo JIT durante los tests.
export default defineConfig({
	plugins: [angular(), tsconfigPaths()],
	test: {
		globals: true,
		environment: 'happy-dom',
		// Por defecto happy-dom navega los frames hijos: cada <iframe> montado dispara un fetch real
		// (p. ej. el embed de Spotify), que al desmontar el frame se aborta y emite un unhandled error
		// que tumba la corrida. Los tests no deben depender de red externa.
		environmentOptions: {
			happyDOM: {
				settings: {
					navigation: { disableChildFrameNavigation: true },
				},
			},
		},
		setupFiles: ['src/test-setup.ts'],
		include: [
			'src/**/*.{test,spec}.ts',
			'scripts/**/*.{test,spec}.ts',
			'resources/**/*.{test,spec}.ts',
			'e2e/_utils/**/*.{test,spec}.ts',
		],
		// @sanity y los bundles fesm de Angular se inlinan para que Vite los transforme.
		server: {
			deps: {
				inline: [/@sanity/, /fesm/],
			},
		},
		coverage: {
			// Solo se colecta en CI (GitHub Actions setea CI=true) para no ralentizar el loop local.
			// Forzable en local con `CI=true` o `COVERAGE=true`.
			enabled: !!process.env['CI'] || !!process.env['COVERAGE'],
			provider: 'v8',
			reportsDirectory: './coverage/cuentoneta',
			// lcov -> Codecov; json-summary + json -> comentario de PR; html -> artefacto; text-summary -> log.
			reporter: ['text-summary', 'html', 'lcov', 'json-summary', 'json'],
		},
	},
});
