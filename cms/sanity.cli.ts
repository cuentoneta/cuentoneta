import { defineCliConfig } from 'sanity/cli';
import path from 'node:path';

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: process.env.SANITY_STUDIO_DATASET,
	},
	// Sin appId fijo, `sanity deploy` pide seleccionar la aplicación por prompt
	// interactivo y falla en CI (entorno no interactivo).
	deployment: {
		appId: '250c71d418c638b6f4236e23',
	},
	typegen: {
		path: '../src/api/**/*.{ts,tsx,js,jsx}',
		schema: 'schema.json',
		generates: '../src/sanity/types.ts',
	},
	// cms es un proyecto pnpm standalone: su build bundlea con Vite y no resuelve los `paths` del
	// tsconfig raíz. Se registra el alias @models hacia el kernel compartido para importar el dominio
	// por shortpath en vez de rutas relativas ../../src/models. __dirname es cms/ (Sanity carga este
	// config con su loader CJS), así que resuelve a <repo>/src/models.
	vite: (config) => ({
		...config,
		resolve: {
			...config.resolve,
			alias: {
				...config.resolve?.alias,
				'@models': path.resolve(__dirname, '../src/models'),
			},
		},
	}),
});
