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
		expect(digest.moves).toBe(1);
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

	it('deriva la rotura del clasificador del núcleo en vez de recontarla', () => {
		const digest = digestOf([indexed('/a'), failed('/b')]);

		expect(digest.breakage).toBe(true);
		expect(digest.failures).toBe(1);
	});

	it('no diffea las filas cuya inspección falló', () => {
		const digest = digestOf([failed('/a')], [stableAt(indexed('/a'))]);

		expect(digest.moves).toBe(0);
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

		expect(digest.moves).toBe(0);
		expect(hasNews(digest)).toBe(false);
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
			existing: { number: 7, lastComment: formatDigestComment(digest) },
		});

		expect(action).toEqual({ kind: 'noop', reason: 'already-reported' });
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

	it('enlaza la corrida solo cuando la conoce', () => {
		const sinEnlace = formatDigestComment(digestOf([indexed('/a'), failed('/b')]));
		const conEnlace = formatDigestComment(
			buildDigest({ rows: [indexed('/a'), failed('/b')], checkedAt: CHECKED_AT, runUrl: 'https://x/run/1' }),
		);

		expect(sinEnlace).not.toContain('Ver la corrida');
		expect(conEnlace).toContain('[Ver la corrida](https://x/run/1)');
	});
});
