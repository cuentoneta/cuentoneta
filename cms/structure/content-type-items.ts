import { createBulkActionsTable } from 'sanity-plugin-bulk-actions-table';
import { filteredDocumentListItems } from 'sanity-plugin-singleton-management';

import { landingPageListItem } from './landing-page-list-item';

// Los tipos de documento no-singleton, planos (sin carpeta intermedia), con overrides: story usa la tabla
// de acciones masivas y landingPage el pane con badge de activa.
export const contentTypeItems = (S, context) =>
	filteredDocumentListItems({ S, context }).map((collection) => {
		if (collection.getId() === 'story') {
			return createBulkActionsTable({ type: 'story', S, context, title: 'Cuentos' });
		}
		if (collection.getId() === 'landingPage') {
			return landingPageListItem(S);
		}
		return collection;
	});
