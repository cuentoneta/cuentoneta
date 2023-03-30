import { defineConfig } from 'sanity';
import deskStructure from './deskStructure';
import schemas from './schemas/schema';

import { LaunchIcon, RobotIcon } from '@sanity/icons';

// Plugins
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { sanityComputedField } from 'sanity-plugin-computed-field';
import { crossDatasetDuplicator } from '@sanity/cross-dataset-duplicator';

export default defineConfig([
    {
        name: 'production-workspace',
        title: 'PROD - La Cuentoneta',
        basePath: '/production',
        icon: LaunchIcon,
        projectId: process.env.SANITY_STUDIO_PROJECT_ID,
        dataset: 'production',
        plugins: [
            deskTool({
                structure: deskStructure,
            }),
            sanityComputedField(),
            crossDatasetDuplicator({
                types: ['story', 'storylist', 'author', 'nationality'],
                tool: true,
                follow: []
            })
        ],
        schema: {
            types: schemas,
        },
    },
    {
        name: 'dev-workspace',
        title: 'DEV - La Cuentoneta',
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
