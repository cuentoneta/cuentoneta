/**
 * Script para generar el archivo de environment utilizado por Angular.
 * Este script debe ejecutarse como paso previo a la compilación de la aplicación
 * (build step).
 *
 * Para mejorar los tiempos de carga del paint inicial de la aplicación, la con-
 * figuración de contenido se obtiene desde las variables de entorno y se deposita
 * en el archivo de environment.ts, el cual es compilado junto con la aplicación.
 *
 * Autor: @rolivencia
 */

// Importar cliente de Sanity
import { client } from '../../src/api/_helpers/sanity-connector';

// Interfaces

// NodeJS & env
import * as dotenv from 'dotenv';

// Leer variables de entorno desde .env
dotenv.config();

// Obtiene la vista de preview para generar skeletons
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
const buildPatches = (storylist) => {
  const { previewGridConfig, gridConfig } = storylist;

  gridConfig.cardsPlacement = gridConfig.cardsPlacement.map((card) => ({
    ...card,
    publication: null,
    story: card?.publication?.story,
    publishingOrder: card?.publication?.order,
    publishingDate: card?.publication?.publishingDate,
  }));
  previewGridConfig.cardsPlacement = previewGridConfig.cardsPlacement.map(
    (card) => ({
      ...card,
      publication: undefined,
      story: card?.publication?.story,
      publishingOrder: card?.publication?.order,
      publishingDate: card?.publication?.publishingDate,
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
