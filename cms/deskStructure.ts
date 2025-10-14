// deskStructure.js
import { createBulkActionsTable } from 'sanity-plugin-bulk-actions-table';

export default (S, context) =>
	S.list()
		.title('Content')
		.items([
			...S.documentTypeListItems().map((collection) => {
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
		]);
