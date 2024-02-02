/* eslint-disable no-console */
import { client } from '../src/api/_helpers/sanity-connector';
import { makeid } from './script.utils'

const fetchDocuments = () =>
    client.fetch(
        `*[_type == 'author' && fullBioUrl != null] { _id, _rev, name, fullBioUrl }[0...2]`
    );
const fetchResourceType = () =>
    client.fetch(
        `*[_type == 'resourceType' && slug.current == 'wikipedia'] { _id } [0]`
    );

const buildPatches = (docs: any[], resourceRefKey: string) =>
    docs.map((doc) => ({
        id: doc._id,
        patch: {
            set: {
                resources: [
                    {
                        _key: makeid(32),
                        _type: 'resource',
                        resourceType: {
                            _type: 'reference',
                            _ref: resourceRefKey,
                        },
                        title: `Artículo de ${doc.name} en Wikipedia`,
                        url: doc.fullBioUrl,
                    },
                ],
            },
            unset: ['fullBioUrl', 'country'],
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
    const resourceRefKey = (await fetchResourceType())._id;
    const documents = (await fetchDocuments());
    console.log(resourceRefKey)
    console.log(documents)
    return
    const patches = buildPatches(documents, resourceRefKey);
    console.log(patches)
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
