import { defineConfig } from 'sanity';
import { requireEnv } from './utils/env';
import deskStructure from './deskStructure';
import schemas from './schemas/schema';

import { LaunchIcon } from '@sanity/icons/Launch';
import { RobotIcon } from '@sanity/icons/Robot';

// Plugins
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { sanityComputedField } from 'sanity-plugin-computed-field';
import { markdownSchema } from 'sanity-plugin-markdown';
import { singletonTools } from 'sanity-plugin-singleton-management';

export default defineConfig([
	{
		name: 'production',
		title: 'PROD - La Cuentoneta',
		basePath: '/production',
		icon: LaunchIcon,
		projectId: requireEnv('SANITY_STUDIO_PROJECT_ID', process.env.SANITY_STUDIO_PROJECT_ID),
		token: process.env.SANITY_STUDIO_API_TOKEN,
		dataset: 'production',
		plugins: [
			structureTool({
				structure: (S, context) => {
					return deskStructure(S, context);
				},
			}),
			sanityComputedField(),
			visionTool(),
			markdownSchema(),
			singletonTools(),
		],
		schema: {
			types: schemas,
		},
	},
	{
		name: 'staging',
		title: 'STAG - La Cuentoneta',
		basePath: '/staging',
		icon: LaunchIcon,
		projectId: requireEnv('SANITY_STUDIO_PROJECT_ID', process.env.SANITY_STUDIO_PROJECT_ID),
		token: process.env.SANITY_STUDIO_API_TOKEN,
		dataset: 'staging',
		plugins: [
			structureTool({
				structure: (S, context) => {
					return deskStructure(S, context);
				},
			}),
			sanityComputedField(),
			visionTool(),
			markdownSchema(),
			singletonTools(),
		],
		schema: {
			types: schemas,
		},
	},
	{
		name: 'development',
		title: 'DEV - La Cuentoneta',
		basePath: '/development',
		icon: RobotIcon,
		projectId: requireEnv('SANITY_STUDIO_PROJECT_ID', process.env.SANITY_STUDIO_PROJECT_ID),
		dataset: 'development',
		plugins: [
			structureTool({
				structure: (S, context) => {
					return deskStructure(S, context);
				},
			}),
			sanityComputedField(),
			visionTool(),
			markdownSchema(),
		],
		schema: {
			types: schemas,
		},
	},
]);
