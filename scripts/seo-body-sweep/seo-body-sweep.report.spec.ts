import {
	buildReport,
	decideAction,
	fingerprint,
	formatConsoleReport,
	formatReportBody,
	formatSummaryMarkdown,
	groupByPrefix,
	type SweepReport,
} from './seo-body-sweep.report';
import type { PageResult } from './seo-body-sweep.helpers';

function reportOf(emptyPaths: string[], unmeasured: { path: string; reason: string }[] = []): SweepReport {
	return { emptyPaths, unmeasured, scanned: 969 };
}

describe('buildReport', () => {
	it('separa vacías de no medidas y cuenta lo barrido', () => {
		const results: PageResult[] = [
			{ path: '/story/ok', outcome: { kind: 'ok' } },
			{ path: '/author/b', outcome: { kind: 'empty', violations: [] } },
			{ path: '/author/a', outcome: { kind: 'empty', violations: [] } },
			{ path: '/story/caida', outcome: { kind: 'unmeasured', reason: 'HTTP 503' } },
		];
		expect(buildReport(results)).toEqual({
			emptyPaths: ['/author/a', '/author/b'],
			unmeasured: [{ path: '/story/caida', reason: 'HTTP 503' }],
			scanned: 4,
		});
	});
});

describe('fingerprint', () => {
	it('no depende del orden de llegada', () => {
		expect(fingerprint(['/b', '/a'])).toBe(fingerprint(['/a', '/b']));
	});

	it('cambia cuando aparece un path nuevo', () => {
		expect(fingerprint(['/a'])).not.toBe(fingerprint(['/a', '/b']));
	});

	it('deduplica', () => {
		expect(fingerprint(['/a', '/a'])).toBe(fingerprint(['/a']));
	});
});

describe('groupByPrefix', () => {
	it('agrupa por tipo de página y ordena por cantidad', () => {
		expect(groupByPrefix(['/author/a', '/story/x', '/author/b', '/author/c'])).toEqual([
			{ prefix: '/author', paths: ['/author/a', '/author/b', '/author/c'] },
			{ prefix: '/story', paths: ['/story/x'] },
		]);
	});
});

describe('decideAction', () => {
	it('crea el seguimiento cuando hay hallazgos y no existe', () => {
		const action = decideAction({ report: reportOf(['/author/a']), existing: null });
		expect(action.kind).toBe('create');
	});

	// La idempotencia es lo que hace tolerable un job semanal: sin esto reescribiría el issue cada
	// lunes y cada reescritura notifica.
	it('no toca nada cuando el conjunto de vacías no cambió', () => {
		const report = reportOf(['/author/a', '/author/b']);
		const existing = { body: formatReportBody(report) };
		expect(decideAction({ report, existing }).kind).toBe('noop');
	});

	it('actualiza cuando aparece un path nuevo', () => {
		const existing = { body: formatReportBody(reportOf(['/author/a'])) };
		expect(decideAction({ report: reportOf(['/author/a', '/author/b']), existing }).kind).toBe('update');
	});

	// Las no medidas quedan fuera de la huella justamente para esto: un 503 distinto cada semana no
	// puede reabrir el seguimiento como si algo hubiera cambiado.
	it('sigue en noop cuando lo único que cambió son las URLs no medidas', () => {
		const existing = { body: formatReportBody(reportOf(['/author/a'], [{ path: '/x', reason: 'HTTP 503' }])) };
		const report = reportOf(['/author/a'], [{ path: '/otra', reason: 'HTTP 502' }]);
		expect(decideAction({ report, existing }).kind).toBe('noop');
	});

	it('avisa la resolución una sola vez y nunca cierra', () => {
		const existing = { body: formatReportBody(reportOf(['/author/a'])) };
		const resolved = decideAction({ report: reportOf([]), existing });
		expect(resolved.kind).toBe('resolved');

		const alreadyResolved = decideAction({
			report: reportOf([]),
			existing: { body: resolved.kind === 'resolved' ? resolved.body : '' },
		});
		expect(alreadyResolved.kind).toBe('noop');
	});

	it('no hace nada cuando no hay hallazgos ni seguimiento previo', () => {
		expect(decideAction({ report: reportOf([]), existing: null }).kind).toBe('noop');
	});
});

describe('formatReportBody', () => {
	it('lista las no medidas sin contarlas como vacías', () => {
		const body = formatReportBody(reportOf(['/author/a'], [{ path: '/story/x', reason: 'HTTP 503' }]));
		expect(body).toContain('/story/x');
		expect(body).toContain('**No** cuentan como páginas vacías');
		expect(body).toContain(`${'<!-- huella:'} ${fingerprint(['/author/a'])} -->`);
	});

	it('omite la sección de no medidas cuando no hay ninguna', () => {
		expect(formatReportBody(reportOf(['/author/a']))).not.toContain('Sin medir');
	});
});

describe('formatConsoleReport', () => {
	it('resume una corrida limpia', () => {
		expect(formatConsoleReport(reportOf([]))).toContain('ninguna vacía');
	});

	it('lista las rutas cuando son pocas: de un puñado se quiere ir a mirarlas', () => {
		const line = formatConsoleReport(reportOf(['/author/a', '/story/x']));
		expect(line).toContain('2 vacías');
		expect(line).toContain('/author/a');
		expect(line).toContain('/story/x');
	});

	it('desglosa por tipo cuando son demasiadas para listar', () => {
		const many = Array.from({ length: 12 }, (_, index) => `/author/a${index}`);
		const line = formatConsoleReport(reportOf([...many, '/story/x']));
		expect(line).toContain('13 vacías');
		expect(line).toContain('/author — 12');
		expect(line).not.toContain('/author/a0\n');
	});

	it('menciona las no medidas', () => {
		expect(formatConsoleReport(reportOf([], [{ path: '/x', reason: 'HTTP 503' }]))).toContain('1 sin medir');
	});
});

describe('formatSummaryMarkdown', () => {
	it('encabeza con el conteo de vacías', () => {
		expect(formatSummaryMarkdown(reportOf(['/author/a']))).toContain('**1** de 969');
	});

	it('dice explícitamente cuando no encontró ninguna', () => {
		expect(formatSummaryMarkdown(reportOf([]))).toContain('ninguna vacía');
	});
});
