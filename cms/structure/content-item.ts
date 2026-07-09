import { createBulkActionsTable } from 'sanity-plugin-bulk-actions-table';
import { filteredDocumentListItems } from 'sanity-plugin-singleton-management';

import { landingPageListItem } from './landing-page-list-item';

// Lista de "Contenido" con overrides por tipo: story usa la tabla de acciones masivas y landingPage el
// pane con badge de activa; el resto queda con el listado por defecto.
export const contentItem = (S, context) =>
	S.listItem()
		.title('Contenido')
		.id('content')
		.child(
			S.list()
				.title('Contenido')
				.items([
					...filteredDocumentListItems({ S, context }).map((collection) => {
						if (collection.getId() === 'story') {
							return createBulkActionsTable({ type: 'story', S, context, title: 'Cuentos' });
						}
						if (collection.getId() === 'landingPage') {
							return landingPageListItem(S);
						}
						return collection;
					}),
				]),
		);
