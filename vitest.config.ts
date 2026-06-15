/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Configuración de Vitest para Angular zoneless (Nx 22 + builder vite/esbuild).
// El plugin de Analog compila componentes/plantillas Angular en modo JIT durante los tests.
export default defineConfig({
	plugins: [angular(), tsconfigPaths()],
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['src/test-setup.ts'],
		include: ['src/**/*.{test,spec}.ts'],
		// @sanity y los bundles fesm de Angular se inlinan para que Vite los transforme.
		server: {
			deps: {
				inline: [/@sanity/, /fesm/],
			},
		},
		coverage: {
			provider: 'v8',
			reportsDirectory: './coverage/cuentoneta',
		},
	},
});
