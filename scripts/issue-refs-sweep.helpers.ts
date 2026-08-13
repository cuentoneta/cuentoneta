/**
 * Núcleo puro del sweep de menciones a issues: junta las referencias vigentes de las tres superficies,
 * decide cuáles caducaron y arma el reporte. Sin I/O — el runner le pasa los estados ya consultados.
 *
 * Existe porque las reglas del repo tienen dos propiedades de naturaleza distinta y solo una está
 * verificada. Que un comentario **no cite** un issue es estático: se comprueba mirando el texto, y lo
 * cubren el hook de escritura y el gate de documentación. Que el issue citado **siga abierto** es
 * temporal: se vuelve falsa sin que nadie toque el repositorio, así que ningún mecanismo que mire
 * escrituras puede detectarlo, y comprobarla exige preguntarle a GitHub.
 *
 * Por eso esto es un job programado que reporta, y no un gate. Como gate haría fallar un PR por una
 * mención que su diff no tocó, porque alguien cerró un issue ajeno: un rojo no accionable por quien lo
 * recibe, y el incentivo inmediato sería saltearlo.
 */

/** Dónde vive una mención vigente. Cada superficie se corrige distinto. */
export type RefSurface = 'allowlist' | 'todo' | 'suppression';

/** Una mención que hoy es legítima porque se asume que su issue está abierto. */
export interface TrackedIssueRef {
	readonly issueNumber: number;
	readonly surface: RefSurface;
	readonly file: string;
	readonly lineNumber?: number;
	readonly detail: string;
}

/**
 * El estado de un issue citado. `missing` y `pull-request` no son adornos:
 *
 * - `missing` es una **cita rota** —un número que no existe—, peor que una caduca.
 * - `pull-request` es un número que resuelve a un PR. El endpoint de issues también los devuelve, así
 *   que sin distinguirlo un PR se reportaría como issue cerrado y su corrección sería la equivocada.
 *   Citar un PR en estas superficies es un error de cita en sí mismo —se cita el issue, no el PR que lo
 *   resuelve—, así que se marca caduco cualquiera sea su estado, con su propio motivo.
 */
export type IssueState = 'open' | 'closed' | 'missing' | 'pull-request';

/** Lo que el sweep decide hacer con el issue de seguimiento. */
export interface SweepAction {
	readonly kind: 'noop' | 'create' | 'update' | 'resolved';
	readonly body?: string;
	readonly comment?: string;
}

const SURFACE_LABELS: Readonly<Record<RefSurface, string>> = Object.freeze({
	allowlist: 'Allowlist de gobernanza',
	todo: 'TODO en comentarios de código',
	suppression: 'Supresión de lint/TS',
});

const FINGERPRINT_PREFIX = '<!-- huella:';

/**
 * El estado que corresponde a una respuesta de la API, o a su fallo.
 *
 * El 404 se reconoce por `(HTTP 404)` y no por la sola presencia de `404`: el mensaje de error embebe
 * el comando, y el comando embebe el número del issue. Sin esa precisión, cualquier fallo —un límite de
 * tasa, un token sin permisos— sobre un issue cuyo número contenga `404` se leería como cita rota, y el reporte
 * invitaría a borrar una referencia válida.
 */
export function classifyIssueState(input: { state: string; isPullRequest: boolean } | { error: string }): IssueState {
	if ('error' in input) {
		if (input.error.includes('(HTTP 404)')) {
			return 'missing';
		}
		throw new Error(input.error);
	}
	if (input.isPullRequest) {
		return 'pull-request';
	}
	return input.state === 'open' ? 'open' : 'closed';
}

/** El issue de seguimiento entre los que devuelve la búsqueda, por igualdad exacta de título. */
export function selectTrackingIssue<T extends { title: string }>(issues: T[], title: string): T | null {
	return issues.find((issue) => issue.title === title) ?? null;
}

/** Junta las referencias vigentes de las tres superficies en una sola lista. */
export function collectTrackedRefs(input: {
	allowlist: Readonly<Record<number, string>>;
	docs: { path: string; mentions: { lineNumber: number; issueNumber: number }[] }[];
	code: { path: string; refs: { lineNumber: number; issueNumber: number; kind: 'todo' | 'suppression' }[] }[];
}): TrackedIssueRef[] {
	const docMentions = input.docs.flatMap(({ path, mentions }) =>
		mentions.map((mention) => ({ file: path, ...mention })),
	);

	// Una entrada de la allowlist sin ninguna mención se conserva igual: la entrada existe aunque
	// todavía nadie la cite, y su caducidad importa lo mismo.
	const allowlist: TrackedIssueRef[] = Object.entries(input.allowlist).map(([number, motivo]) => {
		const citada = docMentions.filter((mention) => mention.issueNumber === Number(number));
		return {
			issueNumber: Number(number),
			surface: 'allowlist',
			// Ordenados: el orden en que llegan los documentos depende del sistema de archivos, y sin
			// esto la huella cambiaría entre corridas sin que cambie el conjunto.
			file:
				citada.length > 0 ? [...new Set(citada.map((mention) => mention.file))].sort().join(', ') : '(sin menciones)',
			detail: motivo,
		};
	});

	const code: TrackedIssueRef[] = input.code.flatMap(({ path, refs }) =>
		refs.map((ref) => ({
			issueNumber: ref.issueNumber,
			surface: ref.kind,
			file: path,
			lineNumber: ref.lineNumber,
			detail: ref.kind === 'todo' ? 'TODO que cita el issue que lo destraba' : 'supresión de lint/TS enlazada',
		})),
	);

	return [...allowlist, ...code];
}

/** Las referencias cuyo issue dejó de estar abierto. Un estado desconocido no caduca nada. */
export function selectStaleRefs(refs: TrackedIssueRef[], states: ReadonlyMap<number, IssueState>): TrackedIssueRef[] {
	return refs.filter((ref) => {
		const state = states.get(ref.issueNumber);
		return state !== undefined && state !== 'open';
	});
}

/**
 * Cadena determinista con las referencias caducas ordenadas. Es lo que vuelve idempotente al job:
 * mismo conjunto de hallazgos ⇒ misma huella ⇒ no se escribe nada.
 */
export function fingerprint(stale: TrackedIssueRef[]): string {
	// Sin el número de línea a propósito: que una mención se corra por una edición ajena no es un
	// hallazgo nuevo, y volvería a escribir el seguimiento sin que nada haya cambiado.
	return [...new Set(stale.map((ref) => `${ref.issueNumber}:${ref.surface}:${ref.file}`))].sort().join('|');
}

/** El cuerpo del issue de seguimiento, agrupado por superficie. */
export function formatReportBody(stale: TrackedIssueRef[], states: ReadonlyMap<number, IssueState>): string {
	const secciones = (['allowlist', 'todo', 'suppression'] as const)
		.map((surface) => {
			const refs = stale.filter((ref) => ref.surface === surface);
			if (refs.length === 0) return '';
			const lineas = refs.map((ref) => {
				const ubicacion = ref.lineNumber ? `${ref.file}:${ref.lineNumber}` : ref.file;
				return `- **#${ref.issueNumber}** (${states.get(ref.issueNumber)}) — \`${ubicacion}\` · ${ref.detail}`;
			});
			return `### ${SURFACE_LABELS[surface]}\n\n${lineas.join('\n')}`;
		})
		.filter(Boolean);

	return [
		'Las siguientes menciones citan issues que ya no están abiertos. Cada una se corrige distinto:',
		'',
		'- **Allowlist de gobernanza:** borrar la entrada de `GOVERNANCE_ISSUE_REFS` y limpiar sus menciones en el mismo PR.',
		'- **TODO en comentarios:** reescribir el `TODO` por su condición real de desbloqueo, sin número.',
		'- **Supresión de lint/TS:** verificar si la supresión sigue haciendo falta; si sí, enlazar el issue vigente.',
		'',
		...secciones,
		'',
		`${FINGERPRINT_PREFIX} ${fingerprint(stale)} -->`,
	].join('\n');
}

/**
 * Qué hacer con el issue de seguimiento. Nunca lo cierra solo: que las menciones ya no caduquen no
 * significa que alguien las haya corregido — pudo cerrarse el issue de seguimiento, o reabrirse el
 * citado. Cerrar es una decisión de una persona.
 */
export function decideAction(input: {
	stale: TrackedIssueRef[];
	states: ReadonlyMap<number, IssueState>;
	existing: { body: string } | null;
}): SweepAction {
	const { stale, states, existing } = input;

	if (stale.length === 0) {
		// El aviso se da **una sola vez**. La huella en el cuerpo es la marca de que el seguimiento
		// todavía reporta hallazgos; al avisar se la quita, así que la corrida siguiente no encuentra
		// nada que resolver. Sin esta guarda comentaría cada semana indefinidamente, porque el job no
		// cierra el issue por diseño: cerrar es una decisión de una persona.
		if (existing === null || !existing.body.includes(FINGERPRINT_PREFIX)) {
			return { kind: 'noop' };
		}
		return {
			kind: 'resolved',
			body: existing.body.replace(new RegExp(`${FINGERPRINT_PREFIX}[^>]*-->`), '<!-- resuelto -->'),
			comment: 'Ya no quedan menciones a issues cerrados. Se puede cerrar este seguimiento.',
		};
	}

	const huella = fingerprint(stale);
	const body = formatReportBody(stale, states);

	if (existing === null) {
		return { kind: 'create', body };
	}
	// Mismo conjunto que la corrida anterior: no se escribe nada, para no acumular ruido si nadie lo atiende.
	return existing.body.includes(`${FINGERPRINT_PREFIX} ${huella} -->`) ? { kind: 'noop' } : { kind: 'update', body };
}

/** La salida de una corrida read-only, compacta: es lo que se lee en la consola del job. */
export function formatConsoleReport(stale: TrackedIssueRef[], total: number): string {
	if (stale.length === 0) {
		return `menciones a issues: ${total} vigentes, ninguna caduca.`;
	}
	const lineas = stale.map((ref) => {
		const ubicacion = ref.lineNumber ? `${ref.file}:${ref.lineNumber}` : ref.file;
		return `  #${ref.issueNumber} [${ref.surface}] ${ubicacion}`;
	});
	return [`menciones a issues: ${total} vigentes, ${stale.length} caducas.`, ...lineas].join('\n');
}
