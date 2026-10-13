/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { availableParallelism } from 'node:os';
import { defineConfig } from 'vitest/config';

// Por encima de ~8 workers de `vmThreads` la suite no se acelera y la memoria sigue creciendo (ver
// "Pool, workers y memoria" en testing.md). El tope no debe superar el default de Vitest, que en
// watch es la mitad de los hilos: el modo se infiere igual que Vitest, y si la inferencia falla solo
// quedan menos workers.
const threads = availableParallelism();
const isWatch = !process.argv.includes('run') && !process.env['CI'] && process.stdin.isTTY;
const maxWorkers = Math.max(1, Math.min(8, isWatch ? Math.floor(threads / 2) : threads - 1));

// Configuración de Vitest para Angular zoneless (Nx 23 + builder vite/esbuild).
// El plugin de Analog compila componentes/plantillas Angular en modo JIT durante los tests.
export default defineConfig({
	// Resolución nativa de los `paths` del tsconfig, en lugar de `vite-tsconfig-paths`: el plugin
	// descubre proyectos recorriendo el árbol, y bajo `.claude/worktrees/` hay copias enteras del
	// repo. Basta con que el tsconfig de una de ellas no le parsee para que aborte y deje de resolver
	// alias en toda la corrida.
	//
	// `fastCompile` transforma archivo por archivo: sin él, cada corrida compila primero el programa
	// entero de `tsconfig.spec.json`, aunque se pida un solo spec. Su transform deja `@Service()` e
	// `@Injectable()` en la clase como decoradores estándar, que V8 no ejecuta. Analog apaga el paso de
	// OXC de Vite; declarar `oxc` lo vuelve a encender, y con `legacy` baja esos decoradores.
	plugins: [angular({ fastCompile: true })],
	resolve: { tsconfigPaths: true },
	oxc: { decorator: { legacy: true } },
	test: {
		globals: true,
		maxWorkers,
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
			'e2e/_utils/**/*.{test,spec}.ts',
			'tools/**/*.{test,spec}.ts',
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
