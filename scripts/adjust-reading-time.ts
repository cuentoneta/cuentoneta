/**
 * Script utilizado para actualizar el campo approximateReadingTime de todos los documentos de tipo story,
 * ajustando así el tiempo de lectura aproximado para cada historia de la plataforma
 *
 * */
import { client } from '../src/api/_helpers/sanity-connector';

const newReadingTimeFormula = (wordCount: number) => Math.ceil((wordCount * 200) / 180);

const fetchDocuments = () => client.fetch(`*[_type == 'story'] {_id, _rev, approximateReadingTime, title}`);

const buildPatches = (docs: any[]) =>
	docs.map((doc) => ({
		id: doc._id,
		patch: {
			set: {
				approximateReadingTime: newReadingTimeFormula(doc.approximateReadingTime),
			},
			ifRevisionID: doc._rev,
		},
	}));

const createTransaction = (patches: any) =>
	patches.reduce((tx: any, patch: any) => tx.patch(patch.id, patch.patch), client.transaction());

const commitTransaction = (tx: any) => tx.commit();

const migrateNextBatch = async (): Promise<any> => {
	const documents = (await fetchDocuments()).filter(
		(doc: any) => newReadingTimeFormula(doc.approximateReadingTime) !== doc.approximateReadingTime,
	);
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
	return migrateNextBatch();
};

migrateNextBatch().catch((err) => {
	console.error(err);
	process.exit(1);
});
