/**
 * Script utilizado para actualizar el campo approximateReadingTime de todos los documentos de tipo story,
 * ajustando así el tiempo de lectura aproximado para cada historia de la plataforma
 *
 * */
import { client } from '../src/api/_helpers/sanity-connector';
import slugify from 'slugify';

const fetchDocuments = () => client.fetch(`*[_type == 'author'] {_id, _rev, name}`);

const buildPatches = (docs: any[]) => {
	return docs.map((doc) => {
		const newSlug = doc.name
			? slugify(doc.name.toLowerCase(), {
					replacement: '-',
					lower: true,
					strict: true,
					trim: true,
				})
			: null;
		return {
			id: doc._id,
			patch: {
				set: {
					slug: {
						_type: 'slug',
						current: newSlug,
					},
				},
				ifRevisionID: doc._rev,
			},
		};
	});
};

const createTransaction = (patches: any) =>
	patches.reduce((tx: any, patch: any) => tx.patch(patch.id, patch.patch), client.transaction());

const commitTransaction = (tx: any) => tx.commit();

const migrateNextBatch = async (): Promise<any> => {
	const documents = await fetchDocuments();
	console.log(documents);
	const patches = buildPatches(documents);
	if (patches.length === 0) {
		console.log('No more documents to migrate!');
		return null;
	}
	console.log(
		`Migrating batch:\n %s`,
		patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
	);
	const transaction = createTransaction(patches);
	await commitTransaction(transaction);
	return null;
};

migrateNextBatch().catch((err) => {
	console.error(err);
	process.exit(1);
});
