import { BookIcon } from '@sanity/icons/Book';
import { createBulkActionsTable } from 'sanity-plugin-bulk-actions-table';
import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import { filteredDocumentListItems } from 'sanity-plugin-singleton-management';

import { landingPageListItem } from './landing-page-list-item';

// Los tipos de documento no-singleton, planos (sin carpeta intermedia), con overrides: story y
// literaryWork usan la tabla de acciones masivas y landingPage el pane con badge de activa.
export const contentTypeItems = (S: StructureBuilder, context: StructureResolverContext) =>
	filteredDocumentListItems({ S, context }).map((collection) => {
		if (collection.getId() === 'story') {
			return createBulkActionsTable({ type: 'story', S, context, title: 'Cuentos' });
		}
		// La tabla trae su propio buscador, que solo mira los campos string de primer nivel: buscar el
		// título de una obra deja de matchear dentro del cuerpo de sus secciones, como sí pasa en el
		// pane nativo.
		if (collection.getId() === 'literaryWork') {
			return createBulkActionsTable({ type: 'literaryWork', S, context, title: 'Obras literarias', icon: BookIcon });
		}
		if (collection.getId() === 'landingPage') {
			return landingPageListItem(S);
		}
		return collection;
	});
