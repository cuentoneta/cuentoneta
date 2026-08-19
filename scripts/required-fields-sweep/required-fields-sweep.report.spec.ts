import {
	breachesOf,
	decideAction,
	fingerprint,
	formatConsoleReport,
	formatReportBody,
	type FieldBreach,
	type SweepReport,
} from './required-fields-sweep.report';

const breach = (label: string, published: number, drafts = 0): FieldBreach => ({ label, published, drafts });

function reportOf(breaches: FieldBreach[], uncovered: SweepReport['uncovered'] = []): SweepReport {
	return { breaches, uncovered, scannedFields: 40 };
}

describe('breachesOf', () => {
	it('leaves out the fields every document fulfils', () => {
		expect(breachesOf([breach('story.title', 0), breach('story.badLanguage', 155)])).toEqual([
			breach('story.badLanguage', 155),
		]);
	});

	it('keeps a field that only drafts breach', () => {
		expect(breachesOf([breach('story.title', 0, 2)])).toEqual([breach('story.title', 0, 2)]);
	});

	it('orders by how widespread the breach is', () => {
		const ordered = breachesOf([breach('a', 3), breach('b', 155), breach('c', 13)]);

		expect(ordered.map((item) => item.label)).toEqual(['b', 'c', 'a']);
	});
});

describe('fingerprint', () => {
	it('does not change when only the counts move', () => {
		expect(fingerprint([breach('story.badLanguage', 155)])).toBe(fingerprint([breach('story.badLanguage', 156)]));
	});

	it('changes when a field joins the set', () => {
		expect(fingerprint([breach('a', 1)])).not.toBe(fingerprint([breach('a', 1), breach('b', 1)]));
	});

	it('does not depend on the order of the input', () => {
		expect(fingerprint([breach('a', 1), breach('b', 1)])).toBe(fingerprint([breach('b', 1), breach('a', 1)]));
	});
});

describe('formatReportBody', () => {
	it('lists every breach with both perspectives', () => {
		const body = formatReportBody(reportOf([breach('story.badLanguage', 155, 4)]));

		expect(body).toContain('| `story.badLanguage` | 155 | 4 |');
	});

	it('declares the paths it cannot measure', () => {
		const body = formatReportBody(
			reportOf(
				[breach('a', 1)],
				[{ documentType: 'storylist', segments: ['mediaSources'], reason: 'array de tipos unión' }],
			),
		);

		expect(body).toContain('storylist.mediaSources');
		expect(body).toContain('array de tipos unión');
	});

	it('omits the uncovered section when everything is measurable', () => {
		expect(formatReportBody(reportOf([breach('a', 1)]))).not.toContain('Fuera de la cobertura');
	});
});

describe('decideAction', () => {
	it('creates the follow-up issue when there is none', () => {
		expect(decideAction({ report: reportOf([breach('a', 1)]), existing: null }).kind).toBe('create');
	});

	it('writes nothing when the set of breaches did not change', () => {
		const body = formatReportBody(reportOf([breach('a', 1)]));

		expect(decideAction({ report: reportOf([breach('a', 1)]), existing: { body } }).kind).toBe('noop');
	});

	// Que un campo se sume es un hallazgo nuevo: el seguimiento tiene que reflejarlo.
	it('updates when a field joins the set', () => {
		const body = formatReportBody(reportOf([breach('a', 1)]));

		expect(decideAction({ report: reportOf([breach('a', 1), breach('b', 1)]), existing: { body } }).kind).toBe(
			'update',
		);
	});

	it('does nothing when there is nothing to report and no follow-up exists', () => {
		expect(decideAction({ report: reportOf([]), existing: null }).kind).toBe('noop');
	});

	it('announces the resolution once, removing the fingerprint', () => {
		const body = formatReportBody(reportOf([breach('a', 1)]));

		const action = decideAction({ report: reportOf([]), existing: { body } });

		expect(action.kind).toBe('resolved');
		expect(action.kind === 'resolved' && action.body).not.toContain('<!-- huella:');
	});

	it('does not announce the resolution twice', () => {
		expect(decideAction({ report: reportOf([]), existing: { body: '<!-- resuelto -->' } }).kind).toBe('noop');
	});

	// Nunca cierra: que el conteo baje a cero puede deberse a que se borró el documento que lo exponía,
	// no a que alguien lo haya atendido. Lo que se afirma es que avisa y deja el issue abierto.
	it('announces the resolution without asking to close the follow-up', () => {
		const body = formatReportBody(reportOf([breach('a', 1)]));

		const action = decideAction({ report: reportOf([]), existing: { body } });

		expect(action.kind).toBe('resolved');
		expect(action.kind === 'resolved' && action.comment).toMatch(/se puede cerrar/i);
	});
});

describe('formatConsoleReport', () => {
	it('reports the clean run naming how many fields it checked', () => {
		expect(formatConsoleReport(reportOf([]))).toContain('40 verificados');
	});

	it('lists each breach with both perspectives', () => {
		expect(formatConsoleReport(reportOf([breach('story.badLanguage', 155, 4)]))).toContain(
			'story.badLanguage — 155 publicados, 4 borradores',
		);
	});
});
