/**
 * Este script fue utilizado el día 13/08/2023 para eliminar la dependencia del schema 'publication' respecto de los
 * schemas 'story' y 'storylist'. Este script reasigna el atributo 'publication' dentro de gridConfig.cardsPlacement
 * y previewGridConfig.cardsPlacement a un objeto que contiene una referencia directa a un registro del schema 'story' y
 * reasigna las demás propiedades antes existentes en 'publication' a dicho objeto.
 *
 * migrateBatch() es la función principal que ejecuta el script, la cual llama a todas las demás.
 *
 * Autor: @rolivencia
 */

// Importar cliente de Sanity
import { client } from '../../src/api/_helpers/sanity-connector';

// NodeJS & env
import * as dotenv from 'dotenv';

// Leer variables de entorno desde .env
dotenv.config();

// Obtiene los datos de las grid configs de todas las storylists
const fetchStorylists = () =>
  client.fetch(
    `*[_type == 'storylist'] 
    {
      _id,
      'previewGridConfig': {
        'cardsPlacement': previewGridConfig.cardsPlacement[] {
          ...,
          'publication': @.publication->
        }
      },
      'gridConfig': {
        'cardsPlacement': @.gridConfig.cardsPlacement[] {
          ...,
          'publication': @.publication->
        }
      }
    }`
  );

// Construye los patches para cada storylist, con la información a reasignar dentro del atributo publication
const buildPatches = (storylist) => {
  const { previewGridConfig, gridConfig } = storylist;

  gridConfig.cardsPlacement = gridConfig.cardsPlacement.map((card) => ({
    ...card,
    publication: {
      story: card?.publication?.story,
      published: card?.publication?.published,
      publishingOrder: card?.publication?.order,
      publishingDate: card?.publication?.publishingDate,
    },
  }));
  previewGridConfig.cardsPlacement = previewGridConfig.cardsPlacement.map(
    (card) => ({
      ...card,
      publication: {
        story: card?.publication?.story,
        published: card?.publication?.published,
        publishingOrder: card?.publication?.order,
        publishingDate: card?.publication?.publishingDate,
      },
    })
  );

  return {
    patch: {
      id: storylist._id,
      set: {
        'previewGridConfig.cardsPlacement': previewGridConfig.cardsPlacement,
        'gridConfig.cardsPlacement': gridConfig.cardsPlacement,
      },
    },
  };
};

const createTransaction = (patches) =>
  patches.reduce(
    (tx, patch) => tx.patch(patch.id, patch.patch),
    client.transaction()
  );

const commitTransaction = (tx) => tx.commit();

const migrateBatch = async () => {
  const storylists = await fetchStorylists();
  let commits = [];

  for (const storylist of storylists) {
    const { slug, title, previewGridConfig, gridConfig } = storylist;

    const previewStoryReferences = previewGridConfig.cardsPlacement?.filter(
      (card) => !!card.slug
    );
    const gridStoryReferences = gridConfig.cardsPlacement?.filter(
      (card) => !!card.slug
    );

    if (!previewStoryReferences || !gridStoryReferences) {
      continue;
    }

    commits = commits.concat(buildPatches(storylist));
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
