import { defineConfig } from 'sanity';
import deskStructure from './deskStructure';
import schemas from './schemas/schema';

import { LaunchIcon, RobotIcon } from '@sanity/icons';

// Plugins
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { sanityComputedField } from 'sanity-plugin-computed-field';
import { iconPicker } from 'sanity-plugin-icon-picker';
import { singletonTools } from 'sanity-plugin-singleton-management';

export default defineConfig([
	{
		name: 'production',
		title: 'PROD - La Cuentoneta',
		basePath: '/production',
		icon: LaunchIcon,
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
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
			iconPicker(),
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
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: 'development',
		plugins: [
			structureTool({
				structure: (S, context) => {
					return deskStructure(S, context);
				},
			}),
			sanityComputedField(),
			visionTool(),
			iconPicker(),
		],
		schema: {
			types: schemas,
		},
	},
]);
