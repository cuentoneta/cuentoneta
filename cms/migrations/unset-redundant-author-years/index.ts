import { at, defineMigration, unset } from 'sanity/migrate';

import { yearOfHistoricalDate } from '@utils/historical-date.utils';

interface AuthorDocument {
	_id: string;
	bornOn?: string | null;
	bornOnYear?: number | null;
	diedOn?: string | null;
	diedOnYear?: number | null;
}

const YEAR_FIELDS = Object.freeze([
	{ date: 'bornOn', year: 'bornOnYear' },
	{ date: 'diedOn', year: 'diedOnYear' },
] as const);

/**
 * Un año persistido sobra cuando la fecha completa lo deriva, y un `null` nunca dice nada que su
 * ausencia no diga. El año cargado a mano para un autor sin fecha, o con una fecha que no se puede leer,
 * es el único dato que el API sigue sirviendo y no se toca.
 */
function isRedundantYear(date: string | null | undefined, year: number | null | undefined): boolean {
	if (year === undefined) return false;
	return year === null || yearOfHistoricalDate(date) !== undefined;
}

/**
 * El año de nacimiento y de fallecimiento lo escribía el plugin computed-field a partir de la fecha. Desde
 * que el API deriva el año de la fecha, lo persistido junto a una fecha completa es un dato derivado que
 * puede divergir de su fuente sin que nadie lo vea, y el plugin dejó `null` en los autores sin fecha.
 *
 * Es acoplada al código: corre **después** de desplegar el ACL que deriva el año. Antes, el API anterior
 * lee el año persistido y devolvería `undefined` para estos autores. Recorre también los borradores, que
 * al publicarse reemplazan al documento publicado.
 */
export default defineMigration({
	title: 'Quitar el año persistido de los autores con fecha completa y los null sin fecha',
	documentTypes: ['author'],
	migrate: {
		document(doc: AuthorDocument) {
			return YEAR_FIELDS.filter(({ date, year }) => isRedundantYear(doc[date], doc[year])).map(({ year }) =>
				at(year, unset()),
			);
		},
	},
});
