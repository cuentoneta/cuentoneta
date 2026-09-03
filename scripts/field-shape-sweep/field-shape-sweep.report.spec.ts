import {
	breachesOf,
	decideAction,
	fingerprint,
	formatConsoleReport,
	formatReportBody,
	remediationHints,
} from './field-shape-sweep.report';

const breach = (label: string, published = 1, drafts = 0) => ({ label, published, drafts });

describe('breachesOf', () => {
	it('descarta los campos sin ningún documento malformado', () => {
		expect(breachesOf([breach('a', 0, 0), breach('b', 2)])).toEqual([breach('b', 2)]);
	});

	it('ordena del más extendido al menos', () => {
		expect(breachesOf([breach('a', 1), breach('b', 5)]).map(({ label }) => label)).toEqual(['b', 'a']);
	});
});

describe('fingerprint', () => {
	// Sin los conteos: que un documento nuevo sume un incumplimiento al mismo campo no es un hallazgo
	// distinto, y reescribiría el seguimiento cada semana sin que nada haya cambiado.
	it('no cambia cuando solo cambian los conteos', () => {
		expect(fingerprint([breach('a', 1)])).toBe(fingerprint([breach('a', 99, 3)]));
	});

	it('cambia cuando aparece un campo nuevo', () => {
		expect(fingerprint([breach('a')])).not.toBe(fingerprint([breach('a'), breach('b')]));
	});

	it('no depende del orden', () => {
		expect(fingerprint([breach('a'), breach('b')])).toBe(fingerprint([breach('b'), breach('a')]));
	});
});

describe('decideAction', () => {
	const report = { breaches: [breach('literaryWork.publishedAt', 26)], scannedFields: 2 };

	it('crea el seguimiento cuando no existe', () => {
		expect(decideAction({ report, existing: null }).kind).toBe('create');
	});

	it('no reescribe el seguimiento cuando la huella coincide', () => {
		const body = formatReportBody(report);

		expect(decideAction({ report, existing: { body } }).kind).toBe('noop');
	});

	it('actualiza cuando el conjunto de campos cambió', () => {
		const body = formatReportBody({ breaches: [breach('otro.campo')], scannedFields: 2 });

		expect(decideAction({ report, existing: { body } }).kind).toBe('update');
	});

	// Nunca cierra solo: que un campo deje de incumplirse no significa que alguien lo haya atendido.
	it('avisa la resolución sin cerrar, y una sola vez', () => {
		const clean = { breaches: [], scannedFields: 2 };
		const withBreaches = { body: formatReportBody(report) };

		expect(decideAction({ report: clean, existing: withBreaches }).kind).toBe('resolved');
		expect(decideAction({ report: clean, existing: { body: 'Ya no quedan campos' } }).kind).toBe('noop');
		expect(decideAction({ report: clean, existing: null }).kind).toBe('noop');
	});
});

describe('formatConsoleReport', () => {
	it('resume la corrida sin hallazgos', () => {
		expect(formatConsoleReport({ breaches: [], scannedFields: 2 })).toContain('ninguna incumplida');
	});

	it('nombra cada campo incumplido con sus dos conteos', () => {
		const output = formatConsoleReport({ breaches: [breach('literaryWork.publishedAt', 26, 1)], scannedFields: 2 });

		expect(output).toContain('literaryWork.publishedAt — 26 publicados, 1 borradores');
	});
});

describe('remediationHints', () => {
	it('indica la remediación del campo con fecha desnuda', () => {
		const hints = remediationHints([breach('literaryWork.publishedAt', 26)]);

		expect(hints).toHaveLength(1);
		expect(hints[0]).toContain('pnpm normalize:bare-published-at --no-dry-run');
	});

	it('no promete remediación para un campo sin una asignada', () => {
		expect(remediationHints([breach('otro.campo', 3)])).toEqual([]);
	});

	it('el cuerpo del seguimiento incluye la remediación del campo incumplido', () => {
		const body = formatReportBody({ breaches: [breach('literaryWork.publishedAt', 26)], scannedFields: 2 });

		expect(body).toContain('### Remediación');
		expect(body).toContain('pnpm normalize:bare-published-at --no-dry-run');
	});

	it('el cuerpo omite la sección cuando ningún campo tiene remediación', () => {
		const body = formatReportBody({ breaches: [breach('otro.campo', 3)], scannedFields: 2 });

		expect(body).not.toContain('### Remediación');
	});
});
