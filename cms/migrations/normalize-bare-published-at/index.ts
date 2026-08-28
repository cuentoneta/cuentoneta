import { at, defineMigration, set } from 'sanity/migrate';

// El schema declara `publishedAt` como `datetime`, pero el dato almacenado no siempre lo cumple:
// hay documentos con la fecha sin componente horario. El value object del dominio exige el instante
// completo, así que el borde de lectura no puede traducirlos y la página de la obra queda sin
// servir. La forma desnuda llegó a las obras copiada de su cuento de origen, que la traía igual.
//
// Se completa a medianoche de Argentina (UTC-3), que es la hora que ya tienen las correcciones
// hechas a mano sobre este mismo campo. Elegir el mediodía o el inicio del día en UTC movería la
// fecha visible de algunas publicaciones al día anterior o siguiente según la zona del lector.
const ARGENTINA_MIDNIGHT_SUFFIX = 'T03:00:00.000Z';

const BARE_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface MigratedDocument {
	_id: string;
	_type: string;
	publishedAt?: string | null;
}

export function publishedAtPatches(document: MigratedDocument) {
	const { publishedAt } = document;

	// La ausencia no es lo que esta migración corrige: la query ya cae a la fecha de creación cuando
	// el campo no está, y completar un instante inventado sería peor que no tener el dato.
	if (publishedAt === undefined || publishedAt === null) {
		return [];
	}

	// Ya tiene hora: sin patch. Es lo que hace idempotente una segunda corrida.
	if (publishedAt.includes('T')) {
		return [];
	}

	// Una forma que no es ni la sana ni la que se viene a corregir no tiene disposición asignada, y
	// completarla a ciegas escribiría un instante arbitrario sobre un dato que nadie miró.
	if (!BARE_DATE.test(publishedAt)) {
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
