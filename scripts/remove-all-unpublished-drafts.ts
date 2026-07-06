/* eslint-disable no-console */
import { getClient } from '../src/api/_helpers/sanity-connector';

async function deleteDrafts() {
	try {
		const drafts = await getClient().fetch(`*[_id in path("drafts.**")]`);
		const deletePromises = drafts.map((draft: { _id: string }) => getClient().delete(draft._id));
		await Promise.all(deletePromises);
		console.log(`${drafts.length} drafts deleted successfully.`);
	} catch (error) {
		console.error('Error deleting drafts:', error);
	}
}

deleteDrafts();
