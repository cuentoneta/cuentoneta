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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// Importar cliente de Sanity
import { client } from '../src/api/_helpers/sanity-connector';

// Obtiene los datos de las grid configs de todas las storylists
const fetchStorylists = () =>
	client.fetch(
		`*[_type == 'storylist']
    {
      _id,
      title,
      gridConfig
    }`,
	);

// Construye los patches para cada storylist, con la información a reasignar dentro del atributo publication
const buildPatches = (storylist) => {
	const { gridConfig } = storylist;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const publications = gridConfig.cardsPlacement
		.map((placement) => ({
			...placement.publication,
			publishingDate: placement.publication.publishingDate ?? new Date().toISOString().slice(0, 10),
		}))
		.filter((publication) => publication.story);

	return {
		patch: {
			id: storylist._id,
			set: {
				publications: publications,
			},
		},
	};
};

const createTransaction = (patches) =>
	patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction());

const commitTransaction = (tx) => tx.commit();

const migrateBatch = async () => {
	const storylists = await fetchStorylists();
	let commits = [];

	for (const storylist of storylists) {
		const { gridConfig } = storylist;

		const gridStoryReferences = gridConfig.cardsPlacement?.filter((card) => !!card.slug);

		if (!gridStoryReferences) {
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
