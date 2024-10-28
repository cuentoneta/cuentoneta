// This script will find and delete all assets that are not
// referenced (in use) by other documents. Sometimes refered
// to as "orphaned" assets.
//
// Place this script somewhere and run it through
// `sanity exec <script-filename.js> --with-user-token`

/* eslint-disable no-console */
// Importar cliente de Sanity
import { client } from '../src/api/_helpers/sanity-connector';
import { Transaction } from '@sanity/client';

const query = `
  *[_type in ["sanity.imageAsset", "sanity.fileAsset"]]
  {_id, "refs": count(*[references(^._id)])}
  [refs == 0]
  ._id
`;

client
	.fetch(query)
	.then((ids) => {
		if (!ids.length) {
			console.log('No assets to delete');
			return true;
		}

		console.log(`Deleting ${ids.length} assets`);
		return ids
			.reduce((trx: Transaction, id: string) => trx.delete(id), client.transaction())
			.commit({ visibility: 'async' })
			.then(() => console.log('Done!'));
	})
	.catch((err) => {
		if (err.message.includes('Insufficient permissions')) {
			console.error(err.message);
			console.error('Did you forget to pass `--with-user-token`?');
		} else {
			console.error(err.stack);
		}
	});
