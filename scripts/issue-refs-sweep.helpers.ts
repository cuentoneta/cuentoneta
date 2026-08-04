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
 * - `pull-request` es un número que resuelve a un PR. El endpoint de issues también los devuelve, y su
 *   `closed` no significa lo mismo: sin distinguirlo, todo PR mergeado citado sería un falso positivo
 *   permanente que nadie podría resolver.
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
			file: citada.length > 0 ? citada.map((mention) => mention.file).join(', ') : '(sin menciones)',
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
	return stale
		.map((ref) => `${ref.issueNumber}:${ref.surface}:${ref.file}:${ref.lineNumber ?? 0}`)
		.sort()
		.join('|');
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
		return existing === null
			? { kind: 'noop' }
			: { kind: 'resolved', comment: 'Ya no quedan menciones a issues cerrados. Se puede cerrar este seguimiento.' };
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
