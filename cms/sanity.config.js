import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';

import deskStructure from './deskStructure';
import schemas from './schemas/schema';

export default defineConfig({
    title: 'La Cuentoneta',
    projectId: 's4dbqkc5',
    dataset: 'production',
    plugins: [
        deskTool({
            structure: deskStructure,
        }),
        visionTool(),
    ],
    schema: {
        types: schemas,
    },
});
