import { fn } from '@test-utils';
import { multiSectionRawLiteraryWork, unmaterializedRawLiteraryWork } from '@mocks/onoff-raw-literary-works.mock';
import type { ReadingTimeMaterializationWriter } from '@models/reading-time-materialization.model';
import {
	formatReadingTimeBackfillReport,
	nextCursor,
	runReadingTimeBackfill,
	toMaterializationInput,
	type LiteraryWorkCandidatePageFetcher,
	type ReadingTimeBackfillCandidate,
} from './backfill-reading-time.helpers';

// Las candidatas se derivan del corpus raw: el shape de la proyección es un subconjunto del de la
// obra completa, así que basta con quedarse con los campos que la query trae.
function toCandidate(raw: typeof unmaterializedRawLiteraryWork): ReadingTimeBackfillCandidate {
	return {
		_id: raw._id,
		slug: raw.slug,
		totalReadingTime: raw.totalReadingTime,
		content: raw.content.map((section) => ({
			_key: section._key,
			body: section.body,
			readingTime: section.readingTime,
		})),
	};
}

const pending = toCandidate(unmaterializedRawLiteraryWork);
const alreadyMaterialized = toCandidate(multiSectionRawLiteraryWork);

class StubCandidatePageFetcher implements LiteraryWorkCandidatePageFetcher {
	public readonly cursors: string[] = [];

	constructor(private readonly pages: ReadingTimeBackfillCandidate[][]) {}

	public fetchPage(cursor: string): Promise<readonly ReadingTimeBackfillCandidate[]> {
		this.cursors.push(cursor);
		return Promise.resolve(this.pages[this.cursors.length - 1] ?? []);
	}
}

function spyWriter() {
	const commit = fn(() => Promise.resolve({}));
	const setIfMissing = fn((_attributes: Record<string, number>) => ({ commit }));
	const patch = fn((_documentId: string) => ({ setIfMissing }));
	return { writer: { patch } as unknown as ReadingTimeMaterializationWriter, patch, setIfMissing, commit };
}

describe('toMaterializationInput', () => {
	it('proyecta la candidata al contrato de la unidad de materialización', () => {
		const input = toMaterializationInput(pending);

		expect(input.totalReadingTime).toBeNull();
		expect(input.sections).toHaveLength(pending.content.length);
		expect(input.sections[0]._key).toBe(pending.content[0]._key);
		expect(input.sections[0].readingTime).toBeNull();
	});
});

describe('nextCursor', () => {
	it('devuelve el _id del último elemento cuando la página vino completa', () => {
		expect(nextCursor([pending, alreadyMaterialized], 2)).toBe(alreadyMaterialized._id);
	});

	it('devuelve null cuando la página vino corta', () => {
		expect(nextCursor([pending], 2)).toBeNull();
	});

	it('devuelve null cuando la página vino vacía', () => {
		expect(nextCursor([], 2)).toBeNull();
	});
});

describe('runReadingTimeBackfill', () => {
	it('en seco reporta lo que llenaría sin escribir', async () => {
		const { writer, patch } = spyWriter();

		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[pending]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		expect(patch).not.toHaveBeenCalled();
		expect(report.inspected).toBe(1);
		expect(report.materialized).toEqual([{ slug: pending.slug, sections: pending.content.length, total: true }]);
	});

	it('al aplicar persiste el patch de la unidad, una vez por candidata', async () => {
		const { writer, patch, setIfMissing, commit } = spyWriter();

		await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[pending]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(patch).toHaveBeenCalledWith(pending._id);
		expect(setIfMissing).toHaveBeenCalledTimes(1);
		expect(commit).toHaveBeenCalledTimes(1);
		expect(Object.keys(setIfMissing.mock.calls[0][0])).toContain('totalReadingTime');
	});

	it('omite la obra que ya tiene sus valores, sin escribirla', async () => {
		const { writer, patch } = spyWriter();

		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[alreadyMaterialized]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(patch).not.toHaveBeenCalled();
		expect(report.skipped).toEqual([alreadyMaterialized.slug]);
		expect(report.materialized).toEqual([]);
	});

	it('recorre las páginas siguientes usando el _id del último elemento como cursor', async () => {
		const { writer } = spyWriter();
		const fetcher = new StubCandidatePageFetcher([[pending, alreadyMaterialized], [pending]]);

		const report = await runReadingTimeBackfill({ fetcher, writer, apply: false, pageSize: 2 });

		expect(fetcher.cursors).toEqual(['', alreadyMaterialized._id]);
		expect(report.inspected).toBe(3);
	});

	// La invariante editorial que motiva el setIfMissing: en obras recitadas el total lo carga a mano
	// quien edita, así que el backfill llena las secciones sin tocarlo.
	it('llena las secciones sin tocar un total ya cargado', async () => {
		const { writer, setIfMissing } = spyWriter();
		const withEditorialTotal: ReadingTimeBackfillCandidate = { ...pending, totalReadingTime: 42 };

		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[withEditorialTotal]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(report.materialized).toEqual([
			{ slug: withEditorialTotal.slug, sections: withEditorialTotal.content.length, total: false },
		]);
		expect(Object.keys(setIfMissing.mock.calls[0][0])).not.toContain('totalReadingTime');
	});

	it('registra como fallida la obra con una sección sin cuerpo', async () => {
		const { writer } = spyWriter();
		const emptyBody: ReadingTimeBackfillCandidate = {
			...pending,
			slug: 'obra-sin-cuerpo',
			content: [{ ...pending.content[0], body: '   ' }],
		};

		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[emptyBody]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		expect(report.failed.map((entry) => entry.slug)).toEqual(['obra-sin-cuerpo']);
		expect(report.materialized).toEqual([]);
	});

	// Un documento roto no puede abortar el backfill del catálogo: se registra y el recorrido sigue.
	it('registra la obra que falla y continúa con el resto de la página', async () => {
		const { writer } = spyWriter();
		const corrupted: ReadingTimeBackfillCandidate = {
			...pending,
			slug: 'obra-con-key-corrupta',
			content: [{ ...pending.content[0], _key: 'key con espacios' }],
		};

		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[corrupted, pending]]),
			writer,
			apply: false,
			pageSize: 3,
		});

		expect(report.failed).toHaveLength(1);
		expect(report.failed[0].slug).toBe('obra-con-key-corrupta');
		expect(report.materialized.map((entry) => entry.slug)).toEqual([pending.slug]);
	});
});

describe('formatReadingTimeBackfillReport', () => {
	it('en seco cierra con el comando para persistir', async () => {
		const { writer } = spyWriter();
		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[pending]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		const lines = formatReadingTimeBackfillReport(report, { apply: false });

		expect(lines.some((line) => line.includes('Se materializarían: 1'))).toBe(true);
		expect(lines.at(-1)).toContain('--no-dry-run');
	});

	it('enumera las obras fallidas con su motivo', async () => {
		const { writer } = spyWriter();
		const corrupted: ReadingTimeBackfillCandidate = {
			...pending,
			slug: 'obra-con-key-corrupta',
			content: [{ ...pending.content[0], _key: 'key con espacios' }],
		};
		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[corrupted]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		const lines = formatReadingTimeBackfillReport(report, { apply: false });

		expect(lines.some((line) => line.includes('Fallidas: 1'))).toBe(true);
		expect(lines.some((line) => line.includes('obra-con-key-corrupta'))).toBe(true);
	});

	it('al aplicar no ofrece el comando y usa el tiempo pasado', async () => {
		const { writer } = spyWriter();
		const report = await runReadingTimeBackfill({
			fetcher: new StubCandidatePageFetcher([[pending]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		const lines = formatReadingTimeBackfillReport(report, { apply: true });

		expect(lines.some((line) => line.includes('Materializadas: 1'))).toBe(true);
		expect(lines.some((line) => line.includes('--no-dry-run'))).toBe(false);
	});
});
