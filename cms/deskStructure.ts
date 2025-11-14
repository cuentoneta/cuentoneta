// deskStructure.js
import { createBulkActionsTable } from 'sanity-plugin-bulk-actions-table';
import { filteredDocumentListItems, singletonDocumentListItems } from 'sanity-plugin-singleton-management';

export default (S, context) =>
	S.list()
		.title('Content')
		.items([
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
								if (['story'].includes(collection.getId())) {
									return createBulkActionsTable({
										type: 'story',
										S,
										context,
										title: 'Cuentos',
									});
								} else {
									return collection;
								}
							}),
						]),
				),
		]);
