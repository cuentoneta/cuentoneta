import {
	buildDigest,
	decideDigestAction,
	fingerprintDigest,
	formatDigestComment,
	hasNews,
	TRACKING_BODY,
} from './seo-index-status.digest';
import { classify, type ClassifiedRow, type DiffBaseline, type InspectionSnapshot } from './seo-index-status.helpers';

const CHECKED_AT = '2026-08-17T07:23:00Z';

function row(overrides: Partial<InspectionSnapshot> = {}): ClassifiedRow {
	return classify({ url: 'https://www.cuentoneta.ar/story/a-la-deriva', ...overrides });
}

const indexed = (url: string) => row({ url, verdict: 'PASS', lastCrawlTime: '2026-08-10T00:00:00Z' });
const crawled = (url: string) => row({ url, verdict: 'NEUTRAL', lastCrawlTime: '2026-08-10T00:00:00Z' });
const neverCrawled = (url: string) => row({ url, verdict: 'NEUTRAL' });
const failed = (url: string, errorStatus?: number) =>
	row({ url, error: 'timeout', ...(errorStatus ? { errorStatus } : {}) });

const valueOf = (observation: ClassifiedRow) => ({
	state: observation.state,
	coverageState: observation.coverageState,
});

/**
 * Historial de una URL que la corrida ANTERIOR ya vio en el valor nuevo, sobre una confirmada que
 * todavía vale el viejo. Al repetir el valor nuevo, la corrida actual lo confirma: es movimiento.
 */
function confirming(now: ClassifiedRow, was: ClassifiedRow): DiffBaseline {
	return { url: now.url, ...valueOf(now), confirmed: valueOf(was) };
}

/**
 * Historial estable en el valor viejo. Un valor nuevo que aparece recién ahora se vio una sola vez,
 * así que queda pendiente hasta que la corrida siguiente lo repita.
 */
function stableAt(was: ClassifiedRow): DiffBaseline {
	return { url: was.url, ...valueOf(was), confirmed: valueOf(was) };
}

const digestOf = (rows: ClassifiedRow[], previous: DiffBaseline[] = []) =>
	buildDigest({ rows, previous, checkedAt: CHECKED_AT });

describe('buildDigest', () => {
	it('cuenta como alta al índice la URL que pasó a indexada', () => {
		const digest = digestOf([indexed('/a')], [confirming(indexed('/a'), crawled('/a'))]);

		expect(digest.toIndexed.map((move) => move.url)).toEqual(['/a']);
		expect(digest.transitions.length).toBe(1);
	});

	// El orden de la clasificación importa: sin él, una URL que nunca se rastreó y aparece indexada
	// contaría en las dos partidas y duplicaría el titular.
	it('no cuenta dos veces la que pasó de nunca rastreada a indexada', () => {
		const digest = digestOf([indexed('/a')], [confirming(indexed('/a'), neverCrawled('/a'))]);

		expect(digest.toIndexed).toHaveLength(1);
		expect(digest.firstCrawl).toHaveLength(0);
	});

	it('separa el primer rastreo de la regresión', () => {
		const digest = digestOf(
			[crawled('/a'), crawled('/b')],
			[confirming(crawled('/a'), neverCrawled('/a')), confirming(crawled('/b'), indexed('/b'))],
		);

		expect(digest.firstCrawl.map((move) => move.url)).toEqual(['/a']);
		expect(digest.regressions.map((move) => move.url)).toEqual(['/b']);
	});

	// "Otros" no es un cajón residual: ahí cae `crawled-not-indexed → never-crawled`, la URL que Google
	// deja de conocer, que es el movimiento que el diff de coverageState existe para hacer visible.
	it('cuenta como otro movimiento el que no es alta, primer rastreo ni regresión', () => {
		const blocked = row({ url: '/a', indexingState: 'BLOCKED_BY_META_TAG' });
		const digest = digestOf([blocked], [confirming(blocked, crawled('/a'))]);

		expect(digest.otherMoves).toHaveLength(1);
		expect(digest.transitions).toHaveLength(1);
		expect(hasNews(digest)).toBe(true);
	});

	it('deriva la rotura del clasificador del núcleo en vez de recontarla', () => {
		const digest = digestOf([indexed('/a'), failed('/b')]);

		expect(digest.breakage).toBe(true);
		expect(digest.failures).toBe(1);
	});

	it('no diffea las filas cuya inspección falló', () => {
		const digest = digestOf([failed('/a')], [stableAt(indexed('/a'))]);

		expect(digest.transitions.length).toBe(0);
		expect(digest.regressions).toHaveLength(0);
	});
});

describe('hasNews', () => {
	it('avisa ante una transición confirmada', () => {
		expect(hasNews(digestOf([indexed('/a')], [confirming(indexed('/a'), crawled('/a'))]))).toBe(true);
	});

	it('avisa ante una rotura aunque no se haya movido nada', () => {
		expect(hasNews(digestOf([indexed('/a'), failed('/b')]))).toBe(true);
	});

	it('calla cuando nada se movió', () => {
		expect(hasNews(digestOf([indexed('/a')], [stableAt(indexed('/a'))]))).toBe(false);
	});

	// Es la propiedad que hace que el aviso no nazca devaluado: el par que oscila entre corridas se
	// observa una vez, no se confirma, y no debe interrumpir a nadie.
	it('calla ante un movimiento observado una sola vez', () => {
		const digest = digestOf([indexed('/a')], [stableAt(crawled('/a'))]);

		expect(digest.transitions.length).toBe(0);
		expect(hasNews(digest)).toBe(false);
	});

	// La corrida puede medir las mil URLs sin una sola falla y romperse al persistir la serie. Si el
	// corte no contara como rotura, ese desenlace quedaría mudo cada vez que además nada se movió.
	it('avisa cuando la corrida midió limpio pero se cortó después', () => {
		const digest = buildDigest({
			rows: [indexed('/a')],
			previous: [stableAt(indexed('/a'))],
			checkedAt: CHECKED_AT,
			abortedBecause: 'ENOSPC al escribir el historial',
		});

		expect(digest.transitions).toHaveLength(0);
		expect(digest.breakage).toBe(true);
		expect(hasNews(digest)).toBe(true);
	});

	it('calla ante una URL inspeccionada por primera vez', () => {
		expect(hasNews(digestOf([indexed('/nueva')], []))).toBe(false);
	});

	it('calla ante un movimiento de coverageState sin cambio de estado', () => {
		const discovered = row({ url: '/a', coverageState: 'Discovered - currently not indexed' });
		const unknown = row({ url: '/a', coverageState: 'URL is unknown to Google' });
		const digest = digestOf([discovered], [confirming(discovered, unknown)]);

		expect(digest.coverageMoves.length).toBeGreaterThan(0);
		expect(hasNews(digest)).toBe(false);
	});
});

describe('fingerprintDigest', () => {
	const digest = () => digestOf([indexed('/a')], [confirming(indexed('/a'), crawled('/a'))]);

	it('no cambia al cambiar la fecha ni el enlace de la corrida', () => {
		const conEnlace = buildDigest({
			rows: [indexed('/a')],
			previous: [confirming(indexed('/a'), crawled('/a'))],
			checkedAt: '2026-09-01T00:00:00Z',
			runUrl: 'https://github.com/…/runs/1',
		});

		expect(fingerprintDigest(conEnlace)).toBe(fingerprintDigest(digest()));
	});

	// Sin la URL en la huella, dos semanas que mueven la misma cantidad de URLs producirían la misma
	// huella y la segunda se leería como repetición: el movimiento real quedaría sin avisar.
	it('distingue dos semanas que mueven la misma cantidad de URLs distintas', () => {
		const otra = digestOf([indexed('/b')], [confirming(indexed('/b'), crawled('/b'))]);

		expect(fingerprintDigest(otra)).not.toBe(fingerprintDigest(digest()));
	});

	// La clase "otros" se agrega por par de estados para el texto. Si la huella se derivara de ese
	// agregado, dos URLs distintas con el mismo par colisionarían — y es la clase donde cae el
	// movimiento peor observable.
	it('distingue dos movimientos de la clase "otros" sobre URLs distintas', () => {
		const blocked = (url: string) => row({ url, indexingState: 'BLOCKED_BY_META_TAG' });
		const unaUrl = digestOf([blocked('/a')], [confirming(blocked('/a'), crawled('/a'))]);
		const otraUrl = digestOf([blocked('/b')], [confirming(blocked('/b'), crawled('/b'))]);

		expect(fingerprintDigest(unaUrl)).not.toBe(fingerprintDigest(otraUrl));
	});

	// Sin magnitud, una semana rota con dos fallas y otra con doscientas se leen igual y la segunda no
	// comenta, aunque el diagnóstico haya empeorado un orden de magnitud.
	it('distingue dos roturas de distinta gravedad', () => {
		const pocas = digestOf([indexed('/a'), failed('/b')]);
		const muchas = digestOf([indexed('/a'), failed('/b'), failed('/c')]);

		expect(fingerprintDigest(pocas)).not.toBe(fingerprintDigest(muchas));
	});

	it('distingue dos corridas abortadas por causas distintas', () => {
		const porCredenciales = buildDigest({ rows: [], checkedAt: CHECKED_AT, abortedBecause: 'faltan credenciales' });
		const porCuota = buildDigest({ rows: [], checkedAt: CHECKED_AT, abortedBecause: 'cuota agotada' });

		expect(fingerprintDigest(porCredenciales)).not.toBe(fingerprintDigest(porCuota));
	});
});

describe('decideDigestAction', () => {
	const conNovedad = () => digestOf([indexed('/a')], [confirming(indexed('/a'), crawled('/a'))]);
	const sinNovedad = () => digestOf([indexed('/a')], [stableAt(indexed('/a'))]);

	it('no hace nada cuando no hay novedad', () => {
		expect(decideDigestAction({ digest: sinNovedad(), existing: null })).toEqual({
			kind: 'noop',
			reason: 'no-news',
		});
	});

	it('crea el seguimiento con su cuerpo estable la primera vez', () => {
		const action = decideDigestAction({ digest: conNovedad(), existing: null });

		expect(action.kind).toBe('create');
		expect(action.kind === 'create' && action.body).toBe(TRACKING_BODY);
	});

	it('comenta sobre el seguimiento existente', () => {
		const action = decideDigestAction({ digest: conNovedad(), existing: { number: 7 } });

		expect(action.kind).toBe('comment');
	});

	it('no repite un comentario cuya huella ya está publicada', () => {
		const digest = conNovedad();
		const action = decideDigestAction({
			digest,
			existing: { number: 7, comments: [formatDigestComment(digest)] },
		});

		expect(action).toEqual({ kind: 'noop', reason: 'already-reported' });
	});

	// El cuerpo de la bitácora invita a suscribirse y comentar. Si la idempotencia mirara solo el
	// último comentario, una respuesta humana la rompería y la corrida siguiente repetiría el aviso.
	it('encuentra la huella aunque no sea el comentario más reciente', () => {
		const digest = conNovedad();
		const action = decideDigestAction({
			digest,
			existing: { number: 7, comments: [formatDigestComment(digest), '¿Esto incluye las fichas de autor?'] },
		});

		expect(action).toEqual({ kind: 'noop', reason: 'already-reported' });
	});

	it('transporta el número del issue en la acción de comentar', () => {
		const action = decideDigestAction({ digest: conNovedad(), existing: { number: 7, comments: [] } });

		expect(action).toEqual({ kind: 'comment', issue: 7, comment: expect.any(String) });
	});
});

describe('formatDigestComment', () => {
	it('abre con los titulares del movimiento', () => {
		const comment = formatDigestComment(digestOf([indexed('/a')], [confirming(indexed('/a'), crawled('/a'))]));

		expect(comment).toContain('**+1** pasaron a indexada');
		expect(comment).toContain('/a');
	});

	it('nombra la rotura cuando la corrida no midió limpio', () => {
		const comment = formatDigestComment(digestOf([indexed('/a'), failed('/b')]));

		expect(comment).toContain('inspecciones fallaron');
	});

	// Una corrida que aborta no midió nada, así que el par fallidas/inspeccionadas vale "0 de 0" y no
	// dice nada. Lo que hay para contar es la causa, y sin ella hay que abrir la corrida — la fricción
	// que la bitácora viene a eliminar.
	it('cuenta la causa cuando la corrida ni llegó a medir', () => {
		const comment = formatDigestComment(
			buildDigest({ rows: [], checkedAt: CHECKED_AT, abortedBecause: 'GSC_SERVICE_ACCOUNT_KEY no es un JSON válido' }),
		);

		expect(comment).toContain('no llegó a medir');
		expect(comment).toContain('GSC_SERVICE_ACCOUNT_KEY no es un JSON válido');
		expect(comment).not.toContain('0 de 0');
	});

	// Decir "no llegó a medir" cuando sí midió desmentiría el movimiento que el propio comentario
	// acaba de informar arriba.
	it('distingue el corte posterior a la medición del que ocurrió antes', () => {
		const comment = formatDigestComment(
			buildDigest({
				rows: [indexed('/a')],
				previous: [confirming(indexed('/a'), crawled('/a'))],
				checkedAt: CHECKED_AT,
				abortedBecause: 'ENOSPC al escribir el historial',
			}),
		);

		expect(comment).toContain('**+1** pasaron a indexada');
		expect(comment).toContain('midió 1 URL(s) y se cortó después');
		expect(comment).not.toContain('no llegó a medir');
	});

	// Un comentario de GitHub tiene tope de tamaño, y el lote grande de primeros rastreos es justo el
	// desenlace que el job existe para celebrar: sin acotar, el aviso se pierde por rechazo de la API.
	it('acota la lista de URLs dejando dicho cuánto recortó', () => {
		const urls = Array.from({ length: 14 }, (_, index) => `/obra-${index}`);
		const comment = formatDigestComment(
			digestOf(
				urls.map((url) => indexed(url)),
				urls.map((url) => confirming(indexed(url), crawled(url))),
			),
		);

		expect(comment).toContain('**+14** pasaron a indexada');
		expect(comment).toContain('…y 4 más');
		expect(comment).not.toContain('- /obra-13');
	});

	// La huella cubre todos los movimientos, así que en crudo crecería con cada uno: hasheada, el
	// comentario no depende del tamaño del lote para caber.
	it('mantiene la huella acotada aunque el lote sea grande', () => {
		const urls = Array.from({ length: 200 }, (_, index) => `/obra-${index}`);
		const digest = digestOf(
			urls.map((url) => indexed(url)),
			urls.map((url) => confirming(indexed(url), crawled(url))),
		);

		expect(fingerprintDigest(digest)).toHaveLength(16);
	});

	it('enlaza la corrida solo cuando la conoce', () => {
		const sinEnlace = formatDigestComment(digestOf([indexed('/a'), failed('/b')]));
		const conEnlace = formatDigestComment(
			buildDigest({ rows: [indexed('/a'), failed('/b')], checkedAt: CHECKED_AT, runUrl: 'https://x/run/1' }),
		);

		expect(sinEnlace).not.toContain('Ver la corrida');
		expect(conEnlace).toContain('[Ver la corrida](https://x/run/1)');
	});
});
