import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import { filteredDocumentListItems } from 'sanity-plugin-singleton-management';

import { landingPageListItem } from './landing-page-list-item';

// Los tipos de documento no-singleton, planos (sin carpeta intermedia), con overrides: landingPage usa
// el pane con badge de activa y literaryWork conserva su título en plural.
export const contentTypeItems = (S: StructureBuilder, context: StructureResolverContext) =>
	filteredDocumentListItems({ S, context }).map((collection) => {
		if (collection.getId() === 'literaryWork') {
			return collection.title('Obras literarias');
		}
		if (collection.getId() === 'landingPage') {
			return landingPageListItem(S);
		}
		return collection;
	});
