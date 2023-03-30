import { defineConfig } from 'sanity';
import deskStructure from './deskStructure';
import schemas from './schemas/schema';

import { LaunchIcon, RobotIcon } from '@sanity/icons';

// Plugins
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { sanityComputedField } from 'sanity-plugin-computed-field';

export default defineConfig([
    {
        name: 'production-workspace',
        title: 'La Cuentoneta',
        basePath: '/production',
        icon: LaunchIcon,
        projectId: process.env.SANITY_STUDIO_PROJECT_ID,
        dataset: 'production',
        plugins: [
            deskTool({
                structure: deskStructure,
            }),
            sanityComputedField(),
        ],
        schema: {
            types: schemas,
        },
    },
    {
        name: 'dev-workspace',
        title: 'La Cuentoneta',
        basePath: '/development',
        icon: RobotIcon,
        projectId: process.env.SANITY_STUDIO_PROJECT_ID,
        dataset: 'development',
        plugins: [
            deskTool({
                structure: deskStructure,
            }),
            sanityComputedField(),
            visionTool(),
        ],
        schema: {
            types: schemas,
        },
    },
]);
