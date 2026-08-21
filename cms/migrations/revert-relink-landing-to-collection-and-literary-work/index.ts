import { at, defineMigration, unset } from 'sanity/migrate';

// Mismo shape mínimo que la migración de ida, más los campos nuevos, que son los que esta reversión mira.
interface RelinkedDocument {
	_id: string;
	_type: 'landingPage' | 'rotatingContent';
	cards?: unknown[];
	latestReads?: unknown[];
	mostRead?: unknown[];
	collections?: unknown[];
	latestLiteraryWorks?: unknown[];
	mostReadLiteraryWorks?: unknown[];
}

/** Un campo se puede dar de baja sólo si su fuente sigue en pie: es de donde se vuelve a derivar. */
function unsetIfSourceSurvives(field: string, source: unknown[] | undefined, value: unknown[] | undefined) {
	if (!value) {
		return [];
	}
	if (!source || source.length === 0) {
		throw new Error(
			`No se puede dar de baja "${field}": su campo de origen ya no está poblado, así que borrarlo destruiría la única copia de esas referencias.`,
		);
	}
	return [at(field, unset())];
}

/**
 * Deshace el reapuntado dando de baja los tres campos nuevos.
 *
 * **Sólo revierte lo que puede volver a derivarse.** Si el campo viejo ya no está poblado —porque el PR
 * de limpieza que lo retira ya corrió—, esta reversión dejó de ser reversible: el campo nuevo pasó a ser
 * la única copia de esas referencias, y borrarlo las destruiría. En ese caso lanza en vez de borrar.
 *
 * Es idempotente: un documento sin los campos nuevos no produce mutación.
 */
export default defineMigration({
	title: 'Revertir el reapuntado de referencias de la página de inicio y del contenido rotativo',
	documentTypes: ['landingPage', 'rotatingContent'],
	filter: "!(_id in path('drafts.**'))",
	migrate: {
		document(doc: RelinkedDocument) {
			if (doc._type === 'rotatingContent') {
				return unsetIfSourceSurvives('mostReadLiteraryWorks', doc.mostRead, doc.mostReadLiteraryWorks);
			}

			return [
				...unsetIfSourceSurvives('collections', doc.cards, doc.collections),
				...unsetIfSourceSurvives('latestLiteraryWorks', doc.latestReads, doc.latestLiteraryWorks),
			];
		},
	},
});
