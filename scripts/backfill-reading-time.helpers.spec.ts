import {
	isEmptyPlan,
	planBackfill,
	sectionReadingTimePath,
	type RawWorkForBackfill,
} from './backfill-reading-time.helpers';

const LONG_BODY = 'palabra '.repeat(401).trim(); // 401 palabras → 3 min por sección
const SHORT_BODY = 'Breve.'; // → 1 min (piso)

function work(content: RawWorkForBackfill['content'], totalReadingTime?: number | null): RawWorkForBackfill {
	return { _id: 'lw_1', totalReadingTime, content };
}

describe('planBackfill', () => {
	it('returns an empty plan when the work is already complete', () => {
		const plan = planBackfill(
			work(
				[
					{ _key: 'a', body: LONG_BODY, readingTime: 3 },
					{ _key: 'b', body: LONG_BODY, readingTime: 3 },
				],
				6,
			),
		);
		expect(isEmptyPlan(plan)).toBe(true);
	});

	it('plans every section and the total for a work with nothing persisted', () => {
		const plan = planBackfill(
			work([
				{ _key: 'a', body: LONG_BODY },
				{ _key: 'b', body: LONG_BODY },
			]),
		);
		expect(plan.sectionReadingTimes).toEqual([
			{ key: 'a', readingTime: 3 },
			{ key: 'b', readingTime: 3 },
		]);
		expect(plan.totalReadingTime).toBe(6);
	});

	it('plans only the missing sections, identified by _key', () => {
		const plan = planBackfill(
			work(
				[
					{ _key: 'a', body: LONG_BODY, readingTime: 3 },
					{ _key: 'b', body: LONG_BODY },
				],
				6,
			),
		);
		expect(plan.sectionReadingTimes).toEqual([{ key: 'b', readingTime: 3 }]);
		expect(plan.totalReadingTime).toBeUndefined();
	});

	it('plans the total as the pure text sum when it is missing but every section has its time', () => {
		const plan = planBackfill(
			work([
				{ _key: 'a', body: LONG_BODY, readingTime: 3 },
				{ _key: 'b', body: SHORT_BODY, readingTime: 1 },
			]),
		);
		expect(plan.sectionReadingTimes).toEqual([]);
		expect(plan.totalReadingTime).toBe(4); // 3 + 1
	});

	it('never lets an editorial override leak into the plan (it is not part of the projection)', () => {
		// `readingTimeOverride` no se proyecta: el total es siempre la suma pura del texto.
		const plan = planBackfill(work([{ _key: 'a', body: LONG_BODY }]));
		expect(plan.totalReadingTime).toBe(3);
	});

	it('is idempotent: a work already patched from a previous run yields an empty plan', () => {
		const raw = work([
			{ _key: 'a', body: LONG_BODY },
			{ _key: 'b', body: SHORT_BODY },
		]);
		expect(isEmptyPlan(planBackfill(raw))).toBe(false);
		// Estado tras aplicar el primer plan: total + readingTime por sección ya presentes.
		const patched = work(
			[
				{ _key: 'a', body: LONG_BODY, readingTime: 3 },
				{ _key: 'b', body: SHORT_BODY, readingTime: 1 },
			],
			4,
		);
		expect(isEmptyPlan(planBackfill(patched))).toBe(true);
	});

	it('propagates the error of an inconsistent work (empty body) so the orchestrator counts it', () => {
		// `createMarkdown('')` lanza: un dato editorial inválido debe fallar en la frontera, no
		// materializar un reading time silenciosamente. El orquestador lo captura por obra.
		expect(() => planBackfill(work([{ _key: 'a', body: '' }]))).toThrow();
	});
});

describe('sectionReadingTimePath', () => {
	it('builds the keyed patch path for a well-formed _key', () => {
		expect(sectionReadingTimePath('a1B2c3')).toBe('content[_key=="a1B2c3"].readingTime');
	});

	it('throws on a _key with unexpected characters (defense in depth)', () => {
		expect(() => sectionReadingTimePath('x"] || *[0]')).toThrow('formato inesperado');
	});
});
