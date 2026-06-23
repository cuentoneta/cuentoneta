import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: process.env.SANITY_STUDIO_DATASET,
	},
	// Sin studioHost, `sanity deploy` pide el hostname por prompt interactivo y falla
	// en CI (entorno no interactivo).
	studioHost: 'cuentoneta',
	typegen: {
		path: '../src/api/**/*.{ts,tsx,js,jsx}',
		schema: 'schema.json',
		generates: '../src/api/sanity/types.ts',
	},
});
