// deskStructure.js
import { CodeBlockIcon, StarIcon } from '@sanity/icons';
import { createBulkActionsTable } from 'sanity-plugin-bulk-actions-table';
import { filteredDocumentListItems, singletonDocumentListItems } from 'sanity-plugin-singleton-management';

import { LandingPageListPane } from './components/LandingPageListPane';
import { API_VERSION, resolveActiveLandingId } from './utils/landing-page';

export default (S, context) =>
	S.list()
		.title('Content')
		.items([
			S.listItem()
				.title('Landing activa')
				.id('active-landing')
				.icon(StarIcon)
				.child(() =>
					resolveActiveLandingId(context.getClient({ apiVersion: API_VERSION }))
						.then((id) =>
							id
								? S.document().documentId(id).schemaType('landingPage').title('Landing activa')
								: S.component(LandingPageListPane).title('Landing activa').id('active-landing-empty'),
						)
						// Ante fallo de red/permisos, cae al pane (que muestra su propio estado de error).
						.catch(() => S.component(LandingPageListPane).title('Landing activa').id('active-landing-error')),
				),
			S.listItem()
				.title('Configuración')
				.id('configuration')
				.child(
					S.list()
						.title('Configuración')
						.items([...singletonDocumentListItems({ S, context })]),
				),
			S.listItem()
				.title('Contenido')
				.id('content')
				.child(
					S.list()
						.title('Contenido')
						.items([
							...filteredDocumentListItems({ S, context }).map((collection) => {
								if (collection.getId() === 'story') {
									return createBulkActionsTable({
										type: 'story',
										S,
										context,
										title: 'Cuentos',
									});
								}
								if (collection.getId() === 'landingPage') {
									return S.listItem()
										.title('Páginas de Inicio')
										.id('landingPage')
										.icon(CodeBlockIcon)
										.child(S.component(LandingPageListPane).title('Páginas de Inicio').id('landingPage-list'));
								}
								return collection;
							}),
						]),
				),
		]);
