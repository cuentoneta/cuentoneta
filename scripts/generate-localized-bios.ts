/**
 * Script utilizado para asignar biografías en múltiples idiomas a los autores de la plataforma
 */
import { client } from '../src/api/_helpers/sanity-connector';

const newReadingTimeFormula = (wordCount: number) =>
  Math.ceil((wordCount * 200) / 180);

const fetchDocuments = () =>
  client.fetch(
    `*[_type == 'author' && biography == null][0...25] { _id, _rev, name, bio }`
  );

const buildPatches = (docs: any[]) =>
  docs.filter(doc => !!doc.bio).map((doc) => ({
    id: doc._id,
    patch: {
      set: {
        biography: { es: [ ...doc.bio ]},
      },
      ifRevisionID: doc._rev,
    },
  }));

const createTransaction = (patches: any) =>
  patches.reduce(
    (tx: any, patch: any) => tx.patch(patch.id, patch.patch),
    client.transaction()
  );

const commitTransaction = (tx: any) => tx.commit();

const migrateNextBatch = async (): Promise<any> => {
  const documents = await fetchDocuments()
  const patches = buildPatches(documents);
  if (patches.length === 0) {
    console.log('No more documents to migrate!');
    return null;
  }
  console.log(
    `Migrating batch:\n %s`,
    patches
      .map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`)
      .join('\n')
  );
  const transaction = createTransaction(patches);
  await commitTransaction(transaction);
  return migrateNextBatch();
};

migrateNextBatch().catch((err) => {
  console.error(err);
  process.exit(1);
});
