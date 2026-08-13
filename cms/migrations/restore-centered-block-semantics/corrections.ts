/**
 * Dato editorial de la migración: qué pasaje de qué obra se reexpresa y en qué.
 *
 * Vive separado del motor porque se revisa distinto. El motor se lee buscando errores de lógica; esta
 * tabla se lee carácter por carácter contra el documento real, que es donde una diferencia mínima
 * —una tilde, un espacio— pasa desapercibida y convierte la corrección en un aborto de la corrida.
 *
 * Se indexa por `_id` publicado. El `_id` es inmutable; el slug lo edita cualquiera desde el Studio,
 * y un slug reusado apuntaría a otra obra.
 */

export const CORRECTION_KINDS = Object.freeze({
	/**
	 * Un bloque enmarcado por dos reglas horizontales que pasa a ser cita. En el original el marco eran
	 * filas de asteriscos centradas —el borde del aviso impreso, no un corte de escena—, así que la
	 * cita lo reemplaza en vez de sumarse a él.
	 */
	quoteRuledBlock: 'quote-ruled-block',
	/** Par literal buscar/reemplazar, para pasajes lo bastante cortos como para transcribirlos. */
	replaceLiteral: 'replace-literal',
} as const);

export type CorrectionKind = (typeof CORRECTION_KINDS)[keyof typeof CORRECTION_KINDS];

interface QuoteRuledBlockCorrection {
	id: string;
	kind: typeof CORRECTION_KINDS.quoteRuledBlock;
	/**
	 * La línea que abre el bloque. El cuerpo del aviso **no** se transcribe: el motor lo toma verbatim
	 * del propio documento, porque son cientos de caracteres de prosa y copiarlos sería reescribir la
	 * obra desde un archivo de configuración.
	 */
	anchor: string;
}

interface ReplaceLiteralCorrection {
	id: string;
	kind: typeof CORRECTION_KINDS.replaceLiteral;
	search: string;
	replacement: string;
}

export type Correction = QuoteRuledBlockCorrection | ReplaceLiteralCorrection;

export const CORRECTIONS_BY_DOCUMENT_ID: Readonly<Record<string, readonly Correction[]>> = Object.freeze({
	// La liga de los pelirrojos — los dos carteles que el relato cita como impresos.
	'lw-from-story-bd3bbc87-71bd-4374-9cf8-417e915669c7': Object.freeze([
		Object.freeze({
			id: 'cartel-apertura',
			kind: CORRECTION_KINDS.quoteRuledBlock,
			anchor: '**A LA LIGA DE LOS PELIRROJOS**',
		}),
		Object.freeze({
			id: 'cartel-disolucion',
			kind: CORRECTION_KINDS.quoteRuledBlock,
			anchor: '**LA LIGA DE LOS PELIRROJOS HA SIDO DISUELTA**',
		}),
	]),
	// Carta a Chichita — la firma, que el original centraba al pie de la carta.
	'lw-from-story-e1138575-5c25-41c4-9bd2-4793642ceb62': Object.freeze([
		Object.freeze({
			id: 'firma',
			kind: CORRECTION_KINDS.replaceLiteral,
			search: 'Un beso de tu\n\nJosé',
			replacement: 'Un beso de tu\n\n*José*',
		}),
	]),
	// Amor a lo lejos — el encabezado de parte quedó pegado al texto que lo sigue, así que renderiza
	// corrido, a diferencia de las tres partes anteriores.
	'lw-from-story-666dac9b-9086-4db9-a17c-d38f6f09532c': Object.freeze([
		Object.freeze({
			id: 'parte-final',
			kind: CORRECTION_KINDS.replaceLiteral,
			search: '**Parte final**Abrí',
			replacement: '**Parte final**\n\nAbrí',
		}),
	]),
});

export const TARGET_DOCUMENT_IDS: readonly string[] = Object.freeze(Object.keys(CORRECTIONS_BY_DOCUMENT_ID));
