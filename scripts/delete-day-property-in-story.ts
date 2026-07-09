// RO - 2023-25-03
// Este script fue utilizado el 25/03/2023 para eliminar el campo day de los documentos de tipo Story en Sanity CMS.
// Queda aquí a modo de ejemplo para saber cómo proceder a la hora de escribir otro script de migración a futuro.

// Importar cliente de Sanity
import { client } from '../src/api/_helpers/sanity-connector';
import type { Transaction } from '@sanity/client';

type StoryDocument = { _id: string; _rev: string };
type StoryPatch = { id: string; patch: { unset: string[]; ifRevisionID: string } };

const fetchStories = () =>
	client.fetch<StoryDocument[]>(`
  *[_type == 'story']
`);

const buildPatches = (stories: StoryDocument[]): StoryPatch[] =>
	stories.map((story) => ({
		id: story._id,
		patch: {
			unset: ['day'],
			ifRevisionID: story._rev,
		},
	}));

const createTransaction = (patches: StoryPatch[]) =>
	patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction());

const commitTransaction = (tx: Transaction) => tx.commit();

const migrateBatch = async () => {
	const stories = await fetchStories();
	const patches = buildPatches(stories);
	if (patches.length === 0) {
		console.log('No hay documentos para migrar!');
		return null;
	}
	console.log(
		`Migrando batch:\n %s`,
		patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
	);
	const transaction = createTransaction(patches);
	await commitTransaction(transaction);
};

migrateBatch().catch((err) => {
	console.error(err);
	process.exit(1);
});
