import { classify, type ClassifiedRow, type InspectionSnapshot } from './seo-index-status.helpers';
import { formatReport, formatSummaryMarkdown } from './seo-index-status.report';

const CHECKED_AT = '2026-08-14T00:00:00Z';

function snapshot(overrides: Partial<InspectionSnapshot> = {}): InspectionSnapshot {
	return { url: 'https://www.cuentoneta.ar/story/a-la-deriva', ...overrides };
}

function row(overrides: Partial<InspectionSnapshot> = {}): ClassifiedRow {
	return classify(snapshot(overrides));
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

	it('muestra los movimientos de coverageState agrupados por par', () => {
		const previous = [
			row({ url: 'a', coverageState: 'Discovered - currently not indexed' }),
			row({ url: 'b', coverageState: 'Discovered - currently not indexed' }),
		];
		const current = [
			row({ url: 'a', coverageState: 'URL is unknown to Google' }),
			row({ url: 'b', coverageState: 'URL is unknown to Google' }),
		];

		const report = formatReport({ rows: current, previous }).join('\n');

		expect(report).toContain('Movimientos de coverageState (2)');
		expect(report).toContain('2  Discovered - currently not indexed → URL is unknown to Google');
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
		expect(formatReport({ rows: [row({ url: 'a' })] }).join('\n')).not.toContain('Cambios contra el historial');
	});

	it('incluye la sección de cambios cuando hay corrida previa', () => {
		const report = formatReport({
			rows: [row({ url: 'a', verdict: 'PASS' })],
			previous: [row({ url: 'a', verdict: 'NEUTRAL' })],
		}).join('\n');

		expect(report).toContain('Cambios contra el historial');
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
		const previous = [row({ url: 'a', verdict: 'NEUTRAL' }), row({ url: 'b', verdict: 'NEUTRAL' })];
		const rows = [row({ url: 'a', verdict: 'PASS' }), row({ url: 'b', verdict: 'PASS' })];

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('| Nunca rastreada → Indexada | 2 |');
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
		const previous = [row({ url: 'a', coverageState: 'Discovered - currently not indexed' })];
		const rows = [row({ url: 'a', coverageState: 'URL is unknown to Google' })];

		const summary = formatSummaryMarkdown({ rows, previous, checkedAt: CHECKED_AT }).join('\n');

		expect(summary).toContain('| Discovered - currently not indexed → URL is unknown to Google | 1 |');
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
