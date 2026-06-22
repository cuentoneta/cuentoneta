import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: process.env.SANITY_STUDIO_DATASET,
	},
	typegen: {
		path: '../src/api/**/*.{ts,tsx,js,jsx}',
		schema: 'schema.json',
		generates: '../src/api/sanity/types.ts',
	},
});
