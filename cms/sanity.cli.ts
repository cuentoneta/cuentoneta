import { defineCliConfig } from 'sanity/cli';

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
		// `path` escanea las GROQ queries (viven en src/api/_queries); `generates` es el output,
		// promovido al kernel (src/app) para que ambas capas tipen contra él vía @sanity-types.
		path: '../src/api/**/*.{ts,tsx,js,jsx}',
		schema: 'schema.json',
		generates: '../src/app/sanity/types.ts',
	},
});
