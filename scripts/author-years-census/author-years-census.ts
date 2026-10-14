/**
 * Censo de solo lectura de los años de nacimiento y de fallecimiento persistidos de los autores. Compara,
 * por dataset, el año guardado con el que el ACL deriva de la fecha completa, para saber qué autores
 * cambian de valor cuando el API deja de leer el año persistido.
 *
 * Es una verificación previa al despliegue de ese cambio, no un gate ni un job programado: se corre una
 * vez por dataset (el dataset sale del entorno) y no escribe nada, ni siquiera con `--no-dry-run`.
 *
 * Código de salida: 0 si ningún autor cambia de valor, 2 si alguno cambia.
 */
import { client } from '../../src/api/_helpers/sanity-connector';
import { environment } from '../../src/api/_helpers/environment';
import { changesServedValue, entriesOf, formatCensusReport, type AuthorYearRow } from './author-years-census.helpers';
import { EXIT_CODES, type OpsTask } from '../ops/registry';

// Sin CDN: el censo tiene que ver el estado real, no una copia que puede tener minutos de atraso.
const sanityClient = client.withConfig({ useCdn: false });

const AUTHORS_QUERY = `*[_type == "author" && !(_id in path("drafts.**"))]{
	"slug": slug.current, bornOn, bornOnYear, diedOn, diedOnYear
}`;

export const task: OpsTask = {
	run: async () => {
		process.stdout.write(
			`Censo de años de autores — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}\n`,
		);

		const rows: AuthorYearRow[] = await sanityClient.fetch(AUTHORS_QUERY);

		// Sin permiso de lectura Sanity devuelve una lista vacía en vez de un error: un censo vacío no puede
		// pasar por un "ningún autor cambia".
		if (rows.length === 0) {
			throw new Error(
				`el dataset "${environment.sanity.dataset}" no devolvió ningún autor: la credencial no alcanza para leerlo, o apunta a un dataset vacío`,
			);
		}

		const entries = rows.flatMap(entriesOf);
		process.stdout.write(`${formatCensusReport(entries)}\n`);

		return entries.some(changesServedValue) ? EXIT_CODES.partial : EXIT_CODES.success;
	},
};
