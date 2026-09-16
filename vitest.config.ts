/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

// Configuración de Vitest para Angular zoneless (Nx 23 + builder vite/esbuild).
// El plugin de Analog compila componentes/plantillas Angular en modo JIT durante los tests.
export default defineConfig({
	// Resolución nativa de los `paths` del tsconfig, en lugar de `vite-tsconfig-paths`: el plugin
	// descubre proyectos recorriendo el árbol, y bajo `.claude/worktrees/` hay copias enteras del
	// repo. Basta con que el tsconfig de una de ellas no le parsee para que aborte y deje de resolver
	// alias en toda la corrida.
	plugins: [angular()],
	resolve: { tsconfigPaths: true },
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
		projects: [
			{
				extends: true,
				test: {
					name: 'app',
					include: ['src/**/*.{test,spec}.ts', 'scripts/**/*.{test,spec}.ts', 'e2e/_utils/**/*.{test,spec}.ts'],
				},
			},
			{
				extends: true,
				test: {
					// Un spec que carga el `eslint.config.mjs` real no puede correr bajo un pool de `vm`: el
					// plugin de Analog fija `vmThreads` salvo que el config declare `pool`, y un módulo JSON
					// importado con `with { type: 'json' }` —la forma que usa el índice de
					// `eslint-plugin-unicorn`— no enlaza entre el contexto de `vm` y el grafo nativo. El
					// costo del pool más lento queda acotado a estos specs, que no son de Angular y no
					// necesitan ni el DOM ni el setup de TestBed.
					name: 'tools',
					include: ['tools/**/*.{test,spec}.ts'],
					pool: 'forks',
					environment: 'node',
					setupFiles: [],
				},
			},
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
