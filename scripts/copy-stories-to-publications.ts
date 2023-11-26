// RO - 2023-25-03
// Este script fue utilizado el 25/03/2023 para eliminar el campo day de los documentos de tipo Story en Sanity CMS.
// Queda aquí a modo de ejemplo para saber cómo proceder a la hora de escribir otro script de migración a futuro.

// Importar cliente de Sanity
import { client } from '../src/api/_helpers/sanity-connector';

// Dayjs para utilizar en el formateo de fechas
import dayjs = require('dayjs');

// const fetchStorylists = () => client.fetch(`*[_type == 'storylist' && slug.current == 'verano-2022']`);
const fetchStorylists = () => client.fetch(`*[_type == 'storylist' && slug.current == 'fec-english-sessions']`);

const buildCommits = (storylist, stories) => {
    // console.log(stories);

    const date = dayjs('2022-01-01');
    // const date = dayjs('2022-01-22');

    return stories.map((story, index) => {
        return {
            _id: `publication--${storylist._id}--${story._ref}`,
            _type: 'publication',
            order: index + 1,
            story: { _key: story._key, _ref: story._ref, _type: 'reference' },
            storylist: { _key: storylist._key, _ref: storylist._id, _type: 'reference' },
            // published: true,
            published: true,
            publishingDate: date.add(index, 'days').format('YYYY-MM-DD'),
            // publishingDate: date.format('YYYY-MM-DD'),
        };
    });
};

const createTransaction = (commits) => commits.reduce((tx, commit) => tx.create(commit), client.transaction());

const commitTransaction = (tx) => tx.commit();

const migrateBatch = async () => {
    const storylists = await fetchStorylists();
    let commits = [];

    for (const storylist of storylists) {
        commits = commits.concat(buildCommits(storylist, storylist.stories));
        console.log(commits);
    }

    if (commits.length === 0) {
        console.log('No hay documentos para migrar!');
        return null;
    }
    const transaction = createTransaction(commits);
    await commitTransaction(transaction);
};

migrateBatch().catch((err) => {
    console.error(err);
    process.exit(1);
});
