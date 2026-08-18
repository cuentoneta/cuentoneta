import { join } from 'node:path';
import {
	classify,
	classifyRunOutcome,
	createPacer,
	CRAWL_STATE,
	DEFAULT_SAMPLE_SIZE,
	EXIT_CODE,
	diffCoverageStates,
	diffStates,
	groupByCoverageState,
	mergeSnapshot,
	parseSampleSize,
	parseSitemapLocs,
	resolveHistoryPaths,
	snapshotOf,
	storedRows,
	summarize,
	toSnapshot,
	type ClassifiedRow,
	type PacerClock,
	type InspectionSnapshot,
} from './seo-index-status.helpers';

function snapshot(overrides: Partial<InspectionSnapshot> = {}): InspectionSnapshot {
	return { url: 'https://www.cuentoneta.ar/story/a-la-deriva', ...overrides };
}

function row(overrides: Partial<InspectionSnapshot> = {}): ClassifiedRow {
	return classify(snapshot(overrides));
}

describe('classify', () => {
	it('marca indexada cuando el verdict es PASS', () => {
		expect(classify(snapshot({ verdict: 'PASS', lastCrawlTime: '2026-07-30T10:00:00Z' })).state).toBe(
			CRAWL_STATE.indexed,
		);
	});

	it('distingue "nunca rastreada" por la AUSENCIA de lastCrawlTime', () => {
		expect(classify(snapshot({ verdict: 'NEUTRAL', coverageState: 'Discovered - currently not indexed' })).state).toBe(
			CRAWL_STATE.neverCrawled,
		);
	});

	it('distingue "rastreada, no indexada" cuando sí hay lastCrawlTime', () => {
		const result = classify(
			snapshot({
				verdict: 'NEUTRAL',
				coverageState: 'Crawled - currently not indexed',
				lastCrawlTime: '2026-07-30T10:00:00Z',
			}),
		);

		expect(result.state).toBe(CRAWL_STATE.crawledNotIndexed);
	});

	it('prioriza el bloqueo por meta tag sobre el resto del diagnóstico', () => {
		const result = classify(snapshot({ verdict: 'NEUTRAL', indexingState: 'BLOCKED_BY_META_TAG' }));

		expect(result.state).toBe(CRAWL_STATE.blocked);
	});

	it('marca bloqueada cuando robots.txt la prohíbe', () => {
		expect(classify(snapshot({ robotsTxtState: 'DISALLOWED' })).state).toBe(CRAWL_STATE.blocked);
	});

	it('marca fallida cuando la inspección erroró, sin mirar el resto', () => {
		expect(classify(snapshot({ error: 'quota exceeded', verdict: 'PASS' })).state).toBe(CRAWL_STATE.failed);
	});

	it('detecta que Google eligió otra canónica', () => {
		const result = classify(
			snapshot({
				userCanonical: 'https://www.cuentoneta.ar/story/a-la-deriva',
				googleCanonical: 'https://www.cuentoneta.ar/story/otro',
			}),
		);

		expect(result.canonicalMismatch).toBe(true);
	});

	it('no reporta mismatch cuando Google todavía no expresó una canónica', () => {
		const result = classify(snapshot({ userCanonical: 'https://www.cuentoneta.ar/story/a-la-deriva' }));

		expect(result.canonicalMismatch).toBe(false);
	});
});

describe('summarize', () => {
	it('cuenta por estado derivado', () => {
		const counts = summarize([
			row({ url: 'a', verdict: 'PASS' }),
			row({ url: 'b', verdict: 'NEUTRAL' }),
			row({ url: 'c', verdict: 'NEUTRAL' }),
			row({ url: 'd', verdict: 'NEUTRAL', lastCrawlTime: '2026-07-30T10:00:00Z' }),
		]);

		expect(counts[CRAWL_STATE.indexed]).toBe(1);
		expect(counts[CRAWL_STATE.neverCrawled]).toBe(2);
		expect(counts[CRAWL_STATE.crawledNotIndexed]).toBe(1);
	});
});

describe('groupByCoverageState', () => {
	it('agrupa por el texto crudo que informa Google', () => {
		const groups = groupByCoverageState([
			row({ url: 'a', coverageState: 'Discovered - currently not indexed' }),
			row({ url: 'b', coverageState: 'Discovered - currently not indexed' }),
			row({ url: 'c', coverageState: 'Submitted and indexed', verdict: 'PASS' }),
		]);

		expect(groups.get('Discovered - currently not indexed')).toBe(2);
		expect(groups.get('Submitted and indexed')).toBe(1);
	});

	it('agrupa las URLs sin coverageState bajo una etiqueta explícita', () => {
		expect(groupByCoverageState([row({ url: 'a' })]).get('(sin coverageState)')).toBe(1);
	});
});

describe('diffStates', () => {
	it('reporta la transición a indexada entre corridas', () => {
		const previous = [row({ url: 'a', verdict: 'NEUTRAL' })];
		const current = [row({ url: 'a', verdict: 'PASS' })];

		const { transitions } = diffStates(previous, current);

		expect(transitions).toEqual([{ url: 'a', from: CRAWL_STATE.neverCrawled, to: CRAWL_STATE.indexed }]);
	});

	it('no reporta transición cuando el estado no cambió', () => {
		const rows = [row({ url: 'a', verdict: 'PASS' })];

		expect(diffStates(rows, rows).transitions).toEqual([]);
	});

	it('separa las URLs que no estaban en la corrida anterior', () => {
		const { added, transitions } = diffStates([row({ url: 'a' })], [row({ url: 'a' }), row({ url: 'b' })]);

		expect(added).toEqual(['b']);
		expect(transitions).toEqual([]);
	});
});

describe('mergeSnapshot', () => {
	it('conserva las URLs que esta corrida no inspeccionó (el bug que pisaba la foto anterior)', () => {
		const store = mergeSnapshot({}, [row({ url: 'a' }), row({ url: 'b' })], '2026-08-04T00:00:00Z');

		const merged = mergeSnapshot(store, [row({ url: 'c' })], '2026-08-05T00:00:00Z');

		expect(Object.keys(merged).sort()).toEqual(['a', 'b', 'c']);
		expect(merged['a']?.checkedAt).toBe('2026-08-04T00:00:00Z');
	});

	it('actualiza la fila y la fecha de una URL ya conocida', () => {
		const store = mergeSnapshot({}, [row({ url: 'a', verdict: 'NEUTRAL' })], '2026-08-04T00:00:00Z');

		const merged = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-05T00:00:00Z');

		expect(Object.keys(merged)).toEqual(['a']);
		expect(merged['a']?.state).toBe(CRAWL_STATE.indexed);
		expect(merged['a']?.checkedAt).toBe('2026-08-05T00:00:00Z');
	});

	it('no muta el store recibido', () => {
		const store = mergeSnapshot({}, [row({ url: 'a' })], '2026-08-04T00:00:00Z');

		mergeSnapshot(store, [row({ url: 'b' })], '2026-08-05T00:00:00Z');

		expect(Object.keys(store)).toEqual(['a']);
	});

	it('storedRows devuelve las filas del historial', () => {
		const store = mergeSnapshot({}, [row({ url: 'a' }), row({ url: 'b' })], '2026-08-04T00:00:00Z');

		expect(
			storedRows(store)
				.map((entry) => entry.url)
				.sort(),
		).toEqual(['a', 'b']);
	});
});

describe('diffCoverageStates', () => {
	// El caso real que motivó esta función: 5 URLs pasaron de "Discovered" a "unknown" entre dos
	// corridas y el diff de estados no lo vio, porque ambos coverageState caen en "nunca rastreada".
	it('detecta un movimiento de coverageState que NO cambia el estado derivado', () => {
		const previous = [row({ url: 'a', coverageState: 'Discovered - currently not indexed' })];
		const current = [row({ url: 'a', coverageState: 'URL is unknown to Google' })];

		expect(diffStates(previous, current).transitions).toEqual([]);
		expect(diffCoverageStates(previous, current)).toEqual([
			{ url: 'a', from: 'Discovered - currently not indexed', to: 'URL is unknown to Google' },
		]);
	});

	it('no reporta nada cuando el coverageState no cambió', () => {
		const rows = [row({ url: 'a', coverageState: 'Submitted and indexed', verdict: 'PASS' })];

		expect(diffCoverageStates(rows, rows)).toEqual([]);
	});

	it('ignora las URLs que no estaban en la corrida anterior', () => {
		const moves = diffCoverageStates([], [row({ url: 'a', coverageState: 'Submitted and indexed' })]);

		expect(moves).toEqual([]);
	});

	it('usa una etiqueta explícita cuando falta el coverageState de alguna punta', () => {
		const moves = diffCoverageStates([row({ url: 'a' })], [row({ url: 'a', coverageState: 'Submitted and indexed' })]);

		expect(moves).toEqual([{ url: 'a', from: '(sin coverageState)', to: 'Submitted and indexed' }]);
	});
});

describe('mergeSnapshot — observación confirmada', () => {
	it('confirma en el acto la primera observación de una URL', () => {
		const store = mergeSnapshot({}, [row({ url: 'a', verdict: 'NEUTRAL' })], '2026-08-04T00:00:00Z');

		expect(store['a']?.confirmed).toEqual({
			checkedAt: '2026-08-04T00:00:00Z',
			state: CRAWL_STATE.neverCrawled,
			coverageState: undefined,
		});
	});

	it('no confirma una diferencia vista una sola vez', () => {
		const store = mergeSnapshot({}, [row({ url: 'a', verdict: 'NEUTRAL' })], '2026-08-04T00:00:00Z');

		const merged = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-05T00:00:00Z');

		expect(merged['a']?.state).toBe(CRAWL_STATE.indexed);
		expect(merged['a']?.confirmed?.state).toBe(CRAWL_STATE.neverCrawled);
		expect(merged['a']?.history).toEqual([]);
	});

	it('confirma la diferencia que se repite, y la fecha es la de su primera aparición', () => {
		let store = mergeSnapshot({}, [row({ url: 'a', verdict: 'NEUTRAL' })], '2026-08-04T00:00:00Z');
		store = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-05T00:00:00Z');

		store = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-06T00:00:00Z');

		expect(store['a']?.confirmed).toEqual({
			checkedAt: '2026-08-05T00:00:00Z',
			state: CRAWL_STATE.indexed,
			coverageState: undefined,
		});
	});

	it('archiva la confirmada anterior recién cuando la diferencia se confirma', () => {
		let store = mergeSnapshot({}, [row({ url: 'a', verdict: 'NEUTRAL' })], '2026-08-04T00:00:00Z');
		store = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-05T00:00:00Z');

		store = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-06T00:00:00Z');

		expect(store['a']?.history).toEqual([
			{ checkedAt: '2026-08-04T00:00:00Z', state: CRAWL_STATE.neverCrawled, coverageState: undefined },
		]);
	});

	it('archiva también un movimiento de coverageState que dura', () => {
		const discovered = row({ url: 'a', coverageState: 'Discovered - currently not indexed' });
		const unknown = row({ url: 'a', coverageState: 'URL is unknown to Google' });
		let store = mergeSnapshot({}, [discovered], '2026-08-04T00:00:00Z');
		store = mergeSnapshot(store, [unknown], '2026-08-05T00:00:00Z');

		store = mergeSnapshot(store, [unknown], '2026-08-06T00:00:00Z');

		expect(store['a']?.history).toHaveLength(1);
		expect(store['a']?.history?.[0]?.coverageState).toBe('Discovered - currently not indexed');
		expect(store['a']?.confirmed?.coverageState).toBe('URL is unknown to Google');
	});

	// El escenario del defecto: el valor va y vuelve sin llegar a confirmarse nunca.
	it('deja la confirmada intacta cuando la observación vuelve a su valor original', () => {
		const discovered = row({ url: 'a', coverageState: 'Discovered - currently not indexed' });
		const unknown = row({ url: 'a', coverageState: 'URL is unknown to Google' });
		let store = mergeSnapshot({}, [discovered], '2026-08-04T00:00:00Z');
		store = mergeSnapshot(store, [unknown], '2026-08-05T00:00:00Z');

		store = mergeSnapshot(store, [discovered], '2026-08-06T00:00:00Z');

		expect(store['a']?.confirmed?.coverageState).toBe('Discovered - currently not indexed');
		expect(store['a']?.history).toEqual([]);
	});

	// Sin esto, medir todas las semanas haría crecer el archivo aunque nada se mueva.
	it('no archiva nada cuando la medición se repite igual', () => {
		const store = mergeSnapshot({}, [row({ url: 'a', verdict: 'PASS' })], '2026-08-04T00:00:00Z');

		const merged = mergeSnapshot(store, [row({ url: 'a', verdict: 'PASS' })], '2026-08-05T00:00:00Z');

		expect(merged['a']?.history).toEqual([]);
		expect(merged['a']?.checkedAt).toBe('2026-08-05T00:00:00Z');
	});

	it('acumula la serie en orden, de la más vieja a la más nueva', () => {
		const crawled = row({ url: 'a', verdict: 'NEUTRAL', lastCrawlTime: 'x' });
		const indexed = row({ url: 'a', verdict: 'PASS' });
		let store = mergeSnapshot({}, [row({ url: 'a', verdict: 'NEUTRAL' })], '2026-08-01T00:00:00Z');
		store = mergeSnapshot(store, [crawled], '2026-08-02T00:00:00Z');
		store = mergeSnapshot(store, [crawled], '2026-08-03T00:00:00Z');
		store = mergeSnapshot(store, [indexed], '2026-08-04T00:00:00Z');
		store = mergeSnapshot(store, [indexed], '2026-08-05T00:00:00Z');

		expect(store['a']?.history?.map((entry) => entry.state)).toEqual([
			CRAWL_STATE.neverCrawled,
			CRAWL_STATE.crawledNotIndexed,
		]);
		expect(store['a']?.state).toBe(CRAWL_STATE.indexed);
	});

	// La forma de las filas que ya viven en la rama de métricas, escritas antes de que el campo
	// existiera: se leen sin migrarlas, y el campo se materializa en el primer merge.
	it('usa los campos de primer nivel como base cuando la fila persistida no tiene confirmada', () => {
		const legacy = { ...row({ url: 'a', verdict: 'NEUTRAL' }), checkedAt: '2026-08-04T00:00:00Z' };

		const merged = mergeSnapshot({ a: legacy }, [row({ url: 'a', verdict: 'PASS' })], '2026-08-05T00:00:00Z');

		expect(merged['a']?.confirmed?.state).toBe(CRAWL_STATE.neverCrawled);
		expect(merged['a']?.history).toEqual([]);
	});
});

describe('mergeSnapshot — una inspección fallida no es una observación', () => {
	it('deja intacta la observación previa de la URL que falló', () => {
		const store = mergeSnapshot({}, [row({ url: 'a', verdict: 'PASS' })], '2026-08-04T00:00:00Z');

		const merged = mergeSnapshot(store, [row({ url: 'a', error: '500', errorStatus: 500 })], '2026-08-11T00:00:00Z');

		expect(merged['a']?.state).toBe(CRAWL_STATE.indexed);
		expect(merged['a']?.checkedAt).toBe('2026-08-04T00:00:00Z');
		expect(merged['a']?.history).toEqual([]);
	});

	it('no da de alta una URL que nunca se pudo inspeccionar', () => {
		const merged = mergeSnapshot({}, [row({ url: 'a', error: '500', errorStatus: 500 })], '2026-08-11T00:00:00Z');

		expect(Object.keys(merged)).toEqual([]);
	});

	it('mergea igual las filas buenas de la misma corrida', () => {
		const rows = [row({ url: 'a', error: '500', errorStatus: 500 }), row({ url: 'b', verdict: 'PASS' })];

		const merged = mergeSnapshot({}, rows, '2026-08-11T00:00:00Z');

		expect(Object.keys(merged)).toEqual(['b']);
	});
});

describe('parseSitemapLocs', () => {
	it('extrae las URLs absolutas del sitemap', () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
			<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
				<url><loc>https://www.cuentoneta.ar/story/a-la-deriva</loc><lastmod>2026-08-03</lastmod></url>
				<url><loc>https://www.cuentoneta.ar/author/alice-munro</loc></url>
			</urlset>`;

		expect(parseSitemapLocs(xml)).toEqual([
			'https://www.cuentoneta.ar/story/a-la-deriva',
			'https://www.cuentoneta.ar/author/alice-munro',
		]);
	});

	it('devuelve vacío ante un sitemap sin entradas', () => {
		expect(parseSitemapLocs('<urlset></urlset>')).toEqual([]);
	});
});

describe('toSnapshot', () => {
	it('retiene los campos informados', () => {
		expect(toSnapshot('https://x/a', { verdict: 'PASS', coverageState: 'Submitted and indexed' })).toEqual({
			url: 'https://x/a',
			verdict: 'PASS',
			coverageState: 'Submitted and indexed',
		});
	});

	it('descarta un campo que la API devuelve nulo, en vez de retenerlo', () => {
		const snapshot = toSnapshot('https://x/a', { verdict: 'NEUTRAL', lastCrawlTime: null });

		expect(snapshot.lastCrawlTime).toBeUndefined();
		expect('lastCrawlTime' in snapshot).toBe(false);
	});

	it('deja "nunca rastreada" una URL cuyo lastCrawlTime vino nulo', () => {
		expect(classify(toSnapshot('https://x/a', { verdict: 'NEUTRAL', lastCrawlTime: null })).state).toBe(
			CRAWL_STATE.neverCrawled,
		);
	});

	it('tolera un resultado ausente', () => {
		expect(toSnapshot('https://x/a', undefined)).toEqual({ url: 'https://x/a' });
	});
});

describe('parseSampleSize', () => {
	it('usa el valor por defecto cuando no se pasó la bandera', () => {
		expect(parseSampleSize(undefined)).toBe(DEFAULT_SAMPLE_SIZE);
	});

	it('acepta un entero positivo', () => {
		expect(parseSampleSize('50')).toBe(50);
	});

	// Sin esto, `slice(0, NaN)` devuelve cero URLs y la corrida sale en verde reportando "0 URL(s)",
	// indistinguible de un sitio sin nada que inspeccionar.
	it('rechaza un valor no numérico en vez de degradarse a cero URLs', () => {
		expect(() => parseSampleSize('abc')).toThrow('--sample espera un entero positivo');
	});

	it.each(['0', '-5', '2.5'])('rechaza "%s"', (raw) => {
		expect(() => parseSampleSize(raw)).toThrow('--sample espera un entero positivo');
	});
});

describe('createPacer', () => {
	function fakeClock(): { clock: PacerClock; slept: number[] } {
		const slept: number[] = [];
		let current = 1000;
		return {
			slept,
			clock: {
				now: () => current,
				sleep: async (ms) => {
					slept.push(ms);
					current += ms;
				},
			},
		};
	}

	it('no espera en el primer despacho', async () => {
		const { clock, slept } = fakeClock();

		await createPacer(500, clock)();

		expect(slept).toEqual([0]);
	});

	it('espacia los despachos sucesivos por el intervalo pedido', async () => {
		const { clock, slept } = fakeClock();
		const pace = createPacer(500, clock);

		await pace();
		await pace();
		await pace();

		expect(slept).toEqual([0, 500, 500]);
	});

	// La invariante que sostiene el respeto de la cuota: dos workers que piden ranura antes de que
	// el primero termine de esperar deben recibir ranuras distintas, no la misma.
	it('reserva la ranura de forma síncrona, así dos llamadas concurrentes no comparten una', async () => {
		const { clock, slept } = fakeClock();
		const pace = createPacer(500, clock);

		await Promise.all([pace(), pace()]);

		expect(slept).toEqual([0, 500]);
	});

	it('no acumula deuda cuando entre despachos ya pasó más que el intervalo', async () => {
		const slept: number[] = [];
		let current = 1000;
		const clock: PacerClock = {
			now: () => current,
			sleep: async (ms) => {
				slept.push(ms);
			},
		};
		const pace = createPacer(500, clock);

		await pace();
		current += 5000;
		await pace();

		expect(slept).toEqual([0, 0]);
	});
});

describe('mergeSnapshot — intentos', () => {
	it('persiste el conteo de intentos en la fila', () => {
		const store = mergeSnapshot({}, [row({ url: 'a', attempts: 2 })], '2026-08-13T00:00:00Z');

		expect(store['a']?.attempts).toBe(2);
	});
});

describe('snapshotOf', () => {
	const snapshotA: InspectionSnapshot = { url: 'a', verdict: 'PASS' };

	it('devuelve la snapshot intacta cuando bastó un intento', () => {
		const result = snapshotOf('a', { ok: true, value: snapshotA, attempts: 1 });

		expect(result).toEqual(snapshotA);
		expect('attempts' in result).toBe(false);
	});

	it('suma el conteo cuando el dato llegó tras un reintento', () => {
		expect(snapshotOf('a', { ok: true, value: snapshotA, attempts: 2 })).toEqual({ ...snapshotA, attempts: 2 });
	});

	it('describe el error cuando la inspección falló tras agotar los intentos', () => {
		const result = snapshotOf('a', { ok: false, error: new Error('Internal error encountered.'), attempts: 3 });

		expect(result).toEqual({ url: 'a', error: 'Internal error encountered.', attempts: 3 });
	});

	// El contrato del campo: `attempts` significa "hubo reintento". Una falla de un solo intento no
	// lo lleva, o cada fila fallida del historial afirmaría un reintento que nunca ocurrió.
	it('omite el conteo cuando la falla fue determinista y no se reintentó', () => {
		const result = snapshotOf('a', { ok: false, error: new Error('403'), attempts: 1 });

		expect(result).toEqual({ url: 'a', error: '403' });
		expect('attempts' in result).toBe(false);
	});

	it('describe un error que no es Error', () => {
		expect(snapshotOf('a', { ok: false, error: 'boom', attempts: 1 })).toEqual({ url: 'a', error: 'boom' });
	});

	it('retiene el status HTTP de la falla', () => {
		const error = Object.assign(new Error('Permission denied.'), { response: { status: 403 } });

		expect(snapshotOf('a', { ok: false, error, attempts: 1 }).errorStatus).toBe(403);
	});

	it('omite el status cuando el error no trae ninguno legible', () => {
		const result = snapshotOf('a', { ok: false, error: new Error('boom'), attempts: 1 });

		expect('errorStatus' in result).toBe(false);
	});

	it('no le cuelga un status a una inspección exitosa', () => {
		const result = snapshotOf('a', { ok: true, value: snapshotA, attempts: 1 });

		expect('errorStatus' in result).toBe(false);
	});
});

describe('classifyRunOutcome', () => {
	const good = row({ url: 'ok', verdict: 'PASS', lastCrawlTime: '2026-08-13T00:00:00Z' });

	it('sale en cero cuando ninguna inspección falló', () => {
		expect(classifyRunOutcome([good])).toBe(EXIT_CODE.ok);
	});

	// Una corrida vacía no midió nada; reportarla en verde la vuelve indistinguible de un sitio sano.
	it('trata una corrida sin filas como fallo de la herramienta', () => {
		expect(classifyRunOutcome([])).toBe(EXIT_CODE.toolFailure);
	});

	it('trata como fallo de la herramienta que TODAS las filas hayan fallado', () => {
		const rows = [row({ url: 'a', error: '500', errorStatus: 500 }), row({ url: 'b', error: '500', errorStatus: 500 })];

		expect(classifyRunOutcome(rows)).toBe(EXIT_CODE.toolFailure);
	});

	it('condena la corrida entera ante una sola falla por permisos', () => {
		const rows = [good, row({ url: 'a', error: 'Permission denied.', errorStatus: 403 })];

		expect(classifyRunOutcome(rows)).toBe(EXIT_CODE.toolFailure);
	});

	it('condena la corrida entera cuando la cuota se agotó', () => {
		const rows = [good, row({ url: 'a', error: 'Quota exceeded.', errorStatus: 429 })];

		expect(classifyRunOutcome(rows)).toBe(EXIT_CODE.toolFailure);
	});

	it('reporta como parcial una falla de servidor suelta', () => {
		const rows = [good, row({ url: 'a', error: 'Internal error encountered.', errorStatus: 500 })];

		expect(classifyRunOutcome(rows)).toBe(EXIT_CODE.partialFailure);
	});

	// Sin status no hay evidencia de que la causa sea común a todas las URLs, y presumirla condenaría
	// la corrida por un error de red suelto.
	it('reporta como parcial una falla sin status legible', () => {
		const rows = [good, row({ url: 'a', error: 'socket hang up' })];

		expect(classifyRunOutcome(rows)).toBe(EXIT_CODE.partialFailure);
	});
});

describe('resolveHistoryPaths', () => {
	it('cae al historial gitignoreado cuando no se pide otro', () => {
		expect(resolveHistoryPaths(undefined)).toEqual({
			file: join('tmp', 'seo-index-status', 'latest.json'),
			dir: join('tmp', 'seo-index-status'),
		});
	});

	it('deriva el directorio de la ruta pedida', () => {
		expect(resolveHistoryPaths('.metrics/seo-index-status/latest.json')).toEqual({
			file: '.metrics/seo-index-status/latest.json',
			dir: '.metrics/seo-index-status',
		});
	});

	it('resuelve al directorio actual una ruta sin directorio', () => {
		expect(resolveHistoryPaths('latest.json')).toEqual({ file: 'latest.json', dir: '.' });
	});

	// Un flag escrito sin valor (`--history=`) llega como cadena vacía, y `dirname('')` da '.': la
	// corrida escribiría un archivo sin nombre en el directorio de trabajo en vez de usar el default.
	it('trata un valor vacío como ausencia del flag', () => {
		expect(resolveHistoryPaths('')).toEqual(resolveHistoryPaths(undefined));
	});
});
