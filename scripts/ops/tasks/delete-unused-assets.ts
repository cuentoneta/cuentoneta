/**
 * Borra los assets huérfanos de Sanity: imágenes y archivos que ningún documento referencia.
 *
 * Uso:
 *   pnpm ops assets:delete-unused
 */
import { client } from '../../../src/api/_helpers/sanity-connector';
import { Transaction } from '@sanity/client';
import { isInsufficientPermissionsError } from './delete-unused-assets.helpers';
import type { OpsTask } from '../registry';

const UNUSED_ASSETS_QUERY = `
  *[_type in ["sanity.imageAsset", "sanity.fileAsset"]]
  {_id, "refs": count(*[references(^._id)])}
  [refs == 0]
  ._id
`;

export const task: OpsTask = {
	run: async () => {
		try {
			const ids = await client.fetch<string[]>(UNUSED_ASSETS_QUERY);

			if (!ids.length) {
				console.log('No assets to delete');
				return;
			}

			console.log(`Deleting ${ids.length} assets`);
			await ids
				.reduce((trx: Transaction, id: string) => trx.delete(id), client.transaction())
				.commit({ visibility: 'async' });
			console.log('Done!');
		} catch (error) {
			if (isInsufficientPermissionsError(error)) {
				throw new Error(`${error.message} ¿Falta SANITY_STUDIO_TOKEN?`, { cause: error });
			}
			throw error;
		}
	},
};
