import { at, defineMigration, set } from 'sanity/migrate';

// El value object del dominio exige el instante completo, así que un documento con la fecha desnuda
// no se puede traducir y su página queda sin servir. El porqué del dato y la elección de la hora
// están en el README de al lado.
const ARGENTINA_MIDNIGHT_SUFFIX = 'T03:00:00.000Z';

const BARE_DATE = /^\d{4}-\d{2}-\d{2}$/;

// La forma no alcanza: `2022-13-45` la cumple y produciría un instante que el value object del
// dominio acepta y el reloj no resuelve, cambiando un error ruidoso por una corrupción callada. Se
// exige además que la fecha exista, comparando contra lo que el calendario devuelve.
function namesARealDate(value: string): boolean {
	const parsed = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

interface MigratedDocument {
	_id: string;
	_type: string;
	publishedAt?: string | null;
}

function publishedAtPatches(document: MigratedDocument) {
	const { publishedAt } = document;

	// La ausencia no es lo que esta migración corrige: la query ya cae a la fecha de creación cuando
	// el campo no está, y completar un instante inventado sería peor que no tener el dato.
	if (publishedAt === undefined || publishedAt === null) {
		return [];
	}

	// Un valor que no es texto no tiene forma que corregir, y dejarlo llegar a la comparación de abajo
	// produciría un error que no nombra el documento.
	if (typeof publishedAt !== 'string') {
		throw new Error(
			`El documento "${document._id}" guarda una fecha de publicación que no es texto: ${JSON.stringify(publishedAt)}`,
		);
	}

	// Ya tiene hora: sin patch. Es lo que hace idempotente una segunda corrida.
	if (publishedAt.includes('T')) {
		return [];
	}

	// Una forma que no es ni la sana ni la que se viene a corregir no tiene disposición asignada, y
	// completarla a ciegas escribiría un instante arbitrario sobre un dato que nadie miró.
	if (!BARE_DATE.test(publishedAt) || !namesARealDate(publishedAt)) {
		throw new Error(
			`El documento "${document._id}" tiene una fecha de publicación de forma desconocida: "${publishedAt}"`,
		);
	}

	return [at('publishedAt', set(`${publishedAt}${ARGENTINA_MIDNIGHT_SUFFIX}`))];
}

export default defineMigration({
	title: 'Completar con hora las fechas de publicación cargadas sin ella',
	documentTypes: ['literaryWork', 'story'],
	migrate: {
		document(document: MigratedDocument) {
			return publishedAtPatches(document);
		},
	},
});
