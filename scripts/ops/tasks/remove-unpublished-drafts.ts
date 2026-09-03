/**
 * Borra todos los borradores no publicados de Sanity. Destructivo: no distingue tipos ni antigüedad,
 * cualquier draft que exista en el dataset al momento de la corrida desaparece.
 *
 * Uso:
 *   pnpm ops drafts:remove-unpublished --no-dry-run
 *
 * No tiene corrida en seco: sin el flag, el dispatcher la rechaza sin cargarla.
 */
import { client } from '../../../src/api/_helpers/sanity-connector';
import type { OpsTask } from '../registry';

export const task: OpsTask = {
	run: async () => {
		const drafts = await client.fetch<readonly { _id: string }[]>(`*[_id in path("drafts.**")]`);
		await Promise.all(drafts.map((draft) => client.delete(draft._id)));
		console.log(`${drafts.length} drafts deleted successfully.`);
	},
};
