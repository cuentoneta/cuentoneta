import {
	buildPatchAttributes,
	isEmptyPlan,
	planReadingTimeMaterialization,
	sectionReadingTimePath,
} from './reading-time-materialization.functions';
import { createReadingTime } from '@models/reading-time.model';

// 401 palabras → ceil(401/200) = 3 min; 2 palabras → mínimo 1 min. Los cuerpos alimentan a countWords real.
const longBody = 'palabra '.repeat(401).trim();
const shortBody = 'hola mundo';

function rawSection(key: string, readingTime: number | null, body: string = longBody) {
	return { _key: key, body, readingTime };
}

describe('planReadingTimeMaterialization', () => {
	it('returns an empty plan when every section and the total are already persisted', () => {
		const plan = planReadingTimeMaterialization({
			totalReadingTime: 6,
			content: [rawSection('a', 3), rawSection('b', 3)],
		});

		expect(plan.sectionReadingTimes).toEqual([]);
		expect(plan.totalReadingTime).toBeUndefined();
		expect(isEmptyPlan(plan)).toBe(true);
	});

	it('plans every section and the total for a fully unmaterialized work', () => {
		const plan = planReadingTimeMaterialization({
			totalReadingTime: null,
			content: [rawSection('a', null), rawSection('b', null)],
		});

		expect(plan.sectionReadingTimes.map((section) => section.key)).toEqual(['a', 'b']);
		expect(plan.sectionReadingTimes.every((section) => section.readingTime === 3)).toBe(true);
		expect(plan.totalReadingTime).toBe(6);
	});

	// El hueco que el spec del repository no cubre: idempotencia parcial — el `.filter(readingTime === null)`
	// enumera SOLO lo faltante, dejando intacto lo ya materializado.
	it('plans only the missing sections on a partially materialized work', () => {
		const plan = planReadingTimeMaterialization({
			totalReadingTime: 6,
			content: [rawSection('a', 3), rawSection('b', null)],
		});

		expect(plan.sectionReadingTimes.map((section) => section.key)).toEqual(['b']);
		expect(plan.sectionReadingTimes[0].readingTime).toBe(3);
		expect(plan.totalReadingTime).toBeUndefined();
		expect(isEmptyPlan(plan)).toBe(false);
	});

	it('plans the total (and nothing else) when only the total is missing', () => {
		const plan = planReadingTimeMaterialization({
			totalReadingTime: null,
			content: [rawSection('a', 3), rawSection('b', 3)],
		});

		expect(plan.sectionReadingTimes).toEqual([]);
		expect(plan.totalReadingTime).toBe(6);
	});

	it('derives the total as the pure sum of the section texts, not any persisted number', () => {
		const plan = planReadingTimeMaterialization({
			totalReadingTime: null,
			content: [rawSection('a', null, longBody), rawSection('b', null, shortBody)],
		});

		// 3 (401 palabras) + 1 (2 palabras) = 4
		expect(plan.totalReadingTime).toBe(4);
	});
});

describe('sectionReadingTimePath', () => {
	it('builds the GROQ patch path for a safe _key', () => {
		expect(sectionReadingTimePath('abc-123_XY')).toBe('content[_key=="abc-123_XY"].readingTime');
	});

	it('throws on a _key with characters unsafe to interpolate', () => {
		expect(() => sectionReadingTimePath('bad key!')).toThrow('_key de sección inválido');
		expect(() => sectionReadingTimePath('a"]{')).toThrow('_key de sección inválido');
	});
});

describe('isEmptyPlan', () => {
	it('is true only when there is nothing to persist', () => {
		expect(isEmptyPlan({ sectionReadingTimes: [] })).toBe(true);
		expect(isEmptyPlan({ sectionReadingTimes: [], totalReadingTime: createReadingTime(6) })).toBe(false);
		expect(isEmptyPlan({ sectionReadingTimes: [{ key: 'a', readingTime: createReadingTime(3) }] })).toBe(false);
	});
});

describe('buildPatchAttributes', () => {
	it('maps the plan to setIfMissing attributes (total + section paths)', () => {
		const attributes = buildPatchAttributes({
			sectionReadingTimes: [{ key: 'a', readingTime: createReadingTime(3) }],
			totalReadingTime: createReadingTime(6),
		});

		expect(attributes).toEqual({ totalReadingTime: 6, 'content[_key=="a"].readingTime': 3 });
	});

	it('omits the total when the plan has none', () => {
		const attributes = buildPatchAttributes({
			sectionReadingTimes: [{ key: 'a', readingTime: createReadingTime(3) }],
		});

		expect(Object.keys(attributes)).toEqual(['content[_key=="a"].readingTime']);
	});

	it('throws (via sectionReadingTimePath) on an unsafe _key', () => {
		expect(() =>
			buildPatchAttributes({ sectionReadingTimes: [{ key: 'bad key!', readingTime: createReadingTime(3) }] }),
		).toThrow('_key de sección inválido');
	});
});
