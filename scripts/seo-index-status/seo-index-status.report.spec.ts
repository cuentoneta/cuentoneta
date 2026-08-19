import { classify, type ClassifiedRow, type DiffBaseline, type InspectionSnapshot } from './seo-index-status.helpers';
import { formatReport, formatSummaryMarkdown } from './seo-index-status.report';

const CHECKED_AT = '2026-08-14T00:00:00Z';

function snapshot(overrides: Partial<InspectionSnapshot> = {}): InspectionSnapshot {
	return { url: 'https://www.cuentoneta.ar/story/a-la-deriva', ...overrides };
}

function row(overrides: Partial<InspectionSnapshot> = {}): ClassifiedRow {
	return classify(snapshot(overrides));
}

/** Fila anterior que ya vio el valor nuevo una vez: la corrida actual lo confirma al repetirlo. */
function shifting(latest: ClassifiedRow, was: ClassifiedRow): DiffBaseline {
	return { ...latest, confirmed: { state: was.state, coverageState: was.coverageState } };
}

describe('formatReport', () => {
	it('informa el conteo por estado y el coverageState crudo', () => {
		const report = formatReport({
			rows: [row({ url: 'a', verdict: 'NEUTRAL', coverageState: 'Discovered - currently not indexed' })],
		}).join('\n');

		expect(report).toContain('Nunca rastreada');
		expect(report).toContain('Discovered - currently not indexed');
	});

	it('destaca las canónicas que Google reasignó, imprimiendo AMBAS', () => {
		// Caso real: difieren en un solo carácter (doble barra). Imprimir solo la de Google hacía
		// que el hallazgo se leyera como dos URLs idénticas.
		const report = formatReport({
			rows: [
				row({
					url: 'https://www.cuentoneta.ar/story/amor',
					userCanonical: 'https://www.cuentoneta.ar//story/amor',
					googleCanonical: 'https://www.cuentoneta.ar/story/amor',
				}),
			],
		}).join('\n');

		expect(report).toContain('Canónica distinta de la declarada');
		expect(report).toContain('declarada:     https://www.cuentoneta.ar//story/amor');
		expect(report).toContain('Google eligió: https://www.cuentoneta.ar/story/amor');
	});

	it('muestra los movimientos confirmados de coverageState agrupados por par', () => {
		const current = [
			row({ url: 'a', coverageState: 'URL is unknown to Google' }),
			row({ url: 'b', coverageState: 'URL is unknown to Google' }),
		];
		const previous = current.map((latest, index) =>
			shifting(latest, row({ url: ['a', 'b'][index], coverageState: 'Discovered - currently not indexed' })),
		);

		const report = formatReport({ rows: current, previous }).join('\n');

		expect(report).toContain('Movimientos confirmados de coverageState (2)');
		expect(report).toContain('2  Discovered - currently not indexed → URL is unknown to Google');
	});

	it('cuenta aparte lo observado una sola vez, sin listarlo', () => {
		const previous = [row({ url: 'a', coverageState: 'Discovered - currently not indexed' })];
		const current = [row({ url: 'a', coverageState: 'URL is unknown to Google' })];

		const report = formatReport({ rows: current, previous }).join('\n');

		expect(report).toContain('Movimientos sin confirmar (1)');
		expect(report).toContain('1  Discovered - currently not indexed → URL is unknown to Google');
		expect(report).not.toContain('Movimientos confirmados de coverageState');
		expect(report).not.toContain('URL is unknown to Google →');
	});

	// Las altas comparten la forma de las filas de esa sección, así que debajo se leerían como una más.
	it('emite las altas antes de la sección de movimientos sin confirmar', () => {
		const report = formatReport({
			rows: [row({ url: 'a', coverageState: 'URL is unknown to Google' }), row({ url: 'nueva' })],
			previous: [row({ url: 'a', coverageState: 'Discovered - currently not indexed' })],
		}).join('\n');

		expect(report.indexOf('inspeccionadas por primera vez')).toBeLessThan(report.indexOf('Movimientos sin confirmar'));
	});

	it('omite la sección de observaciones sin confirmar cuando no hay ninguna', () => {
		const rows = [row({ url: 'a', coverageState: 'Submitted and indexed', verdict: 'PASS' })];

		expect(formatReport({ rows, previous: rows }).join('\n')).not.toContain('Movimientos sin confirmar');
	});

	it('omite la sección de coverageState cuando nada se movió', () => {
		const rows = [row({ url: 'a', coverageState: 'Submitted and indexed', verdict: 'PASS' })];

		expect(formatReport({ rows, previous: rows }).join('\n')).not.toContain('Movimientos de coverageState');
	});

	it('avisa cuántas URLs del historial quedaron sin inspeccionar', () => {
		const report = formatReport({
			rows: [row({ url: 'a' })],
			previous: [row({ url: 'a' }), row({ url: 'b' }), row({ url: 'c' })],
		}).join('\n');

		expect(report).toContain('2 URL(s) del historial NO se inspeccionaron');
	});

	it('lista las inspecciones fallidas con su causa', () => {
		const report = formatReport({ rows: [row({ url: 'a', error: 'quota exceeded' })] }).join('\n');

		expect(report).toContain('quota exceeded');
	});

	it('omite la sección de cambios cuando no hay corrida previa', () => {
		expect(formatReport({ rows: [row({ url: 'a' })] }).join('\n')).not.toContain('Cambios confirmados');
	});

	it('no reporta como movimiento una inspección que falló', () => {
		const report = formatReport({
			rows: [row({ url: 'a', error: '500', errorStatus: 500 })],
			previous: [row({ url: 'a', verdict: 'PASS' })],
		}).join('\n');

		expect(report).not.toContain('Indexada → La inspección falló');
		expect(report).toContain('(sin cambios de estado)');
		expect(report).toContain('1 URL(s) del historial NO se inspeccionaron');
	});

	it('incluye la sección de cambios cuando hay corrida previa', () => {
		const indexed = row({ url: 'a', verdict: 'PASS' });
		const report = formatReport({
			rows: [indexed],
			previous: [shifting(indexed, row({ url: 'a', verdict: 'NEUTRAL' }))],
		}).join('\n');

		expect(report).toContain('Cambios confirmados contra el historial');
		expect(report).toContain('Nunca rastreada → Indexada');
	});
});

describe('formatReport — reintentos', () => {
	it('informa los reintentos consumidos cuando hubo alguno', () => {
		const report = formatReport({ rows: [row({ url: 'a' })], retries: 3 }).join('\n');

		expect(report).toContain('Reintentos consumidos: 3');
	});

	it.each([[0], [undefined]])('omite la línea cuando no hubo reintentos (%s)', (retries) => {
		const report = formatReport({ rows: [row({ url: 'a' })], retries }).join('\n');

		expect(report).not.toContain('Reintentos consumidos');
	});

	it('distingue una URL que agotó sus intentos de otra que falló de entrada', () => {
		const report = formatReport({
			rows: [row({ url: 'a', error: 'Internal error encountered.', attempts: 3 }), row({ url: 'b', error: '403' })],
		}).join('\n');

		expect(report).toContain('a — Internal error encountered. (tras 3 intentos)');
		expect(report).toContain('b — 403');
		expect(report).not.toContain('b — 403 (tras');
	});
});

describe('formatSummaryMarkdown', () => {
	it('encabeza con el universo medido y la tabla de estados', () => {
		const summary = formatSummaryMarkdown({
			rows: [row({ url: 'a', verdict: 'PASS' }), row({ url: 'b', verdict: 'NEUTRAL' })],
			checkedAt: CHECKED_AT,
		}).join('\n');

		expect(summary).toContain('## Estado de indexado');
		expect(summary).toContain(`2 URL(s) inspeccionadas el ${CHECKED_AT}.`);
		expect(summary).toContain('| Estado | URLs |');
		expect(summary).toContain('| Indexada | 1 |');
		expect(summary).toContain('| Nunca rastreada | 1 |');
	});

	it('omite de la tabla los estados sin ninguna URL', () => {
		const summary = formatSummaryMarkdown({ rows: [row({ url: 'a', verdict: 'PASS' })], checkedAt: CHECKED_AT });

		expect(summary.join('\n')).not.toContain('Bloqueada para indexar');
	});

	it('no emite el bloque de movimiento sin corrida previa', () => {
		const summary = formatSummaryMarkdown({ rows: [row({ url: 'a' })], checkedAt: CHECKED_AT }).join('\n');

		expect(summary).not.toContain('Movimiento contra');
	});

	it('agrupa las transiciones por par con su conteo', () => {
		const rows = [row({ url: 'a', verdict: 'PASS' }), row({ url: 'b', verdict: 'PASS' })];
		const previous = rows.map((latest, index) => shifting(latest, row({ url: ['a', 'b'][index], verdict: 'NEUTRAL' })));

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('| Nunca rastreada → Indexada | 2 |');
	});

	it('subordina lo observado una sola vez a su propia tabla', () => {
		const previous = [row({ url: 'a', verdict: 'NEUTRAL' })];
		const rows = [row({ url: 'a', verdict: 'PASS' })];

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('_Sin cambios de estado._');
		expect(summary).toContain('#### Movimientos sin confirmar (1)');
		expect(summary).toContain('| Nunca rastreada → Indexada | 1 |');
	});

	it('dice explícitamente que nada se movió', () => {
		const rows = [row({ url: 'a', verdict: 'PASS' })];

		const summary = formatSummaryMarkdown({ rows, previous: rows, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('_Sin cambios de estado._');
	});

	it('informa como conteos las altas y las URLs que quedaron sin mirar', () => {
		const summary = formatSummaryMarkdown({
			rows: [row({ url: 'a' }), row({ url: 'nueva' })],
			previous: [row({ url: 'a' }), row({ url: 'b' }), row({ url: 'c' })],
			checkedAt: CHECKED_AT,
		}).join('\n');

		expect(summary).toContain('- 1 URL(s) inspeccionadas por primera vez');
		expect(summary).toContain('- 2 URL(s) del historial NO se inspeccionaron en esta corrida');
	});

	it('reporta los movimientos de coverageState que no mueven el estado', () => {
		const rows = [row({ url: 'a', coverageState: 'URL is unknown to Google' })];
		const previous = [shifting(rows[0], row({ url: 'a', coverageState: 'Discovered - currently not indexed' }))];

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('| Discovered - currently not indexed → URL is unknown to Google | 1 |');
	});

	// El resumen de una corrida programada es público, y el mensaje de un 403 puede arrastrar el
	// client_email de la service account.
	it('describe la falla por su status en vez de por el mensaje de la API', () => {
		const rows = [
			row({ url: 'a', error: 'Request had insufficient authentication scopes for robot@x.iam', errorStatus: 403 }),
		];

		const summary = formatSummaryMarkdown({ rows, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('`a` — HTTP 403');
		expect(summary).not.toContain('robot@x.iam');
	});

	it('acota el mensaje de una falla sin status legible', () => {
		const rows = [row({ url: 'a', error: 'x'.repeat(200) })];

		const summary = formatSummaryMarkdown({ rows, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain(`\`a\` — ${'x'.repeat(60)}…`);
		expect(summary).not.toContain('x'.repeat(61));
	});

	// El resumen se lee de un vistazo o no se lee: 968 URLs fallidas no pueden entrar enteras.
	it('acota los detalles largos y dice cuántos quedaron afuera', () => {
		const rows = Array.from({ length: 12 }, (_, index) => row({ url: `u${index}`, error: 'boom' }));

		const summary = formatSummaryMarkdown({ rows, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('### Inspecciones fallidas (12)');
		expect(summary).toContain('`u9`');
		expect(summary).not.toContain('`u10`');
		expect(summary).toContain('- …y 2 más');
	});

	it('destaca las canónicas reasignadas por Google', () => {
		const rows = [
			row({
				url: 'https://www.cuentoneta.ar/story/amor',
				userCanonical: 'https://www.cuentoneta.ar//story/amor',
				googleCanonical: 'https://www.cuentoneta.ar/story/amor',
			}),
		];

		const summary = formatSummaryMarkdown({ rows, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('### Canónica distinta de la declarada (1)');
	});

	// La falla ya se cuenta en su propio bloque; contarla otra vez como movimiento la disfrazaría de
	// un cambio del indexado que no ocurrió.
	it('no convierte una inspección fallida en un movimiento de estado', () => {
		const previous = [row({ url: 'a', verdict: 'PASS' })];
		const rows = [row({ url: 'a', error: '500', errorStatus: 500 })];

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).not.toContain('Indexada → La inspección falló');
		expect(summary).toContain('_Sin cambios de estado._');
	});

	it('cuenta como no inspeccionada la URL cuya inspección falló', () => {
		const previous = [row({ url: 'a', verdict: 'PASS' })];
		const rows = [row({ url: 'a', error: '500', errorStatus: 500 })];

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('- 1 URL(s) del historial NO se inspeccionaron en esta corrida');
	});

	it('informa los reintentos solo cuando hubo alguno', () => {
		const rows = [row({ url: 'a', verdict: 'PASS' })];

		expect(formatSummaryMarkdown({ rows, retries: 4, checkedAt: CHECKED_AT }).join('\n')).toContain(
			'Reintentos consumidos: 4',
		);
		expect(formatSummaryMarkdown({ rows, retries: 0, checkedAt: CHECKED_AT }).join('\n')).not.toContain(
			'Reintentos consumidos',
		);
	});
});
