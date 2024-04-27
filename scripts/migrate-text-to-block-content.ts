/* eslint-disable no-console */
import { client } from '../src/api/_helpers/sanity-connector';
import { makeid } from './script.utils'


// length(description) returns null if description isn't a (Portable Text) array
const fetchDocuments = () =>
  client.fetch(
    `*[_type == 'author'] {_id, _rev, bio}`
  );

const buildPatches = (docs: any[]) =>
  docs.map((doc) => ({
    id: doc._id,
    patch: {
      set: {
        bio: [
          {
            style: 'normal',
            _type: 'block',
            children: [
              {
                _type: 'span',
                marks: [],
                text: doc.bio,
                _key: makeid(32)
              },
            ],
            markDefs: [],
            _key: makeid(32)
          },
        ],
      },
      // this will cause the migration to fail if any of the documents has been
      // modified since it was fetched.
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
  const documents = (await fetchDocuments()).filter((doc: any) => typeof(doc.bio) === 'string');
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
