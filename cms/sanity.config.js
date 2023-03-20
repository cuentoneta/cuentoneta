import { defineConfig } from 'sanity';
import deskStructure from './deskStructure';
import schemas from './schemas/schema';

// Plugins
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { sanityComputedField } from 'sanity-plugin-computed-field';

export default defineConfig({
    title: 'La Cuentoneta',
    projectId: 's4dbqkc5',
    dataset: 'production',
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
});
