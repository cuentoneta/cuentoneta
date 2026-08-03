import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Config propia del Studio, separada de la raíz: cms es un proyecto pnpm standalone con su propio
// árbol de node_modules, y la config raíz carga el plugin de Angular, que no tiene nada que aportar
// acá. Cubre lógica Node pura (sin DOM, sin testing library): lo que corre en el Studio y no en la app.
export default defineConfig({
	test: {
		include: ['**/*.spec.ts'],
		// El bundler del Studio lee los alias de sanity.cli.ts, que Vitest no carga: hay que repetirlos acá.
		alias: {
			'@models': path.resolve(__dirname, '../src/models'),
			'@utils': path.resolve(__dirname, '../src/utils'),
		},
	},
});
