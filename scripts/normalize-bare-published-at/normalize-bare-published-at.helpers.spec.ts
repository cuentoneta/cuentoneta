import { fn } from '@test-utils';
import {
	formatPublishedAtNormalizationReport,
	nextCursor,
	normalizedPublishedAt,
	runPublishedAtNormalization,
	type PublishedAtCandidate,
	type PublishedAtCandidatePageFetcher,
	type PublishedAtNormalizationWriter,
} from './normalize-bare-published-at.helpers';

class StubCandidatePageFetcher implements PublishedAtCandidatePageFetcher {
	public readonly cursors: string[] = [];

	constructor(private readonly pages: PublishedAtCandidate[][]) {}

	public fetchPage(cursor: string): Promise<readonly PublishedAtCandidate[]> {
		this.cursors.push(cursor);
		return Promise.resolve(this.pages[this.cursors.length - 1] ?? []);
	}
}

function spyWriter() {
	const commit = fn(() => Promise.resolve({}));
	const set = fn<(attributes: { readonly publishedAt: string }) => { commit: typeof commit }>(() => ({ commit }));
	const patch = fn<(documentId: string) => { set: typeof set }>(() => ({ set }));
	return { writer: { patch } as unknown as PublishedAtNormalizationWriter, patch, set, commit };
}

const bare = { _id: 'obra', publishedAt: '2022-01-23' };

describe('normalizedPublishedAt', () => {
	it('completa la fecha desnuda a medianoche de Argentina', () => {
		expect(normalizedPublishedAt(bare)).toBe('2022-01-23T03:00:00.000Z');
	});

	// Una segunda corrida no debe producir mutación: es lo que permite re-aplicarla sin pensar.
	it('no toca una fecha que ya trae hora', () => {
		expect(normalizedPublishedAt({ _id: 'obra', publishedAt: '2022-02-01T01:18:27Z' })).toBeNull();
	});

	it.each([undefined, null])('no completa nada cuando el campo vale %p', (publishedAt) => {
		expect(normalizedPublishedAt({ _id: 'obra', publishedAt })).toBeNull();
	});

	// La clave puede faltar del todo (es lo que devuelve la query cuando el documento no la trae),
	// no solo venir en null: ambas formas son la misma ausencia.
	it('no completa nada cuando la clave está ausente', () => {
		expect(normalizedPublishedAt({ _id: 'obra' })).toBeNull();
	});

	// Una forma que no es ni la sana ni la que se corrige no tiene disposición: la corrida se detiene
	// nombrando el documento, en vez de escribirle un instante arbitrario.
	it.each(['2022-1-3', '23/01/2022', '', '2022-13-45', '2022-02-30'])(
		'aborta ante la forma desconocida %p',
		(publishedAt) => {
			expect(() => normalizedPublishedAt({ _id: 'obra-rara', publishedAt })).toThrow('obra-rara');
		},
	);

	it('aborta cuando el valor no es texto', () => {
		const noEsTexto = { _id: 'obra-rara', publishedAt: 20220123 } as unknown as PublishedAtCandidate;

		expect(() => normalizedPublishedAt(noEsTexto)).toThrow('obra-rara');
	});
});

describe('nextCursor', () => {
	it('devuelve el _id del último elemento cuando la página vino completa', () => {
		expect(nextCursor([bare, { _id: 'otra' }], 2)).toBe('otra');
	});

	it('devuelve null cuando la página vino corta', () => {
		expect(nextCursor([bare], 2)).toBeNull();
	});

	it('devuelve null cuando la página vino vacía', () => {
		expect(nextCursor([], 2)).toBeNull();
	});
});

describe('runPublishedAtNormalization', () => {
	it('en seco reporta lo que normalizaría sin escribir', async () => {
		const { writer, patch } = spyWriter();

		const report = await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[bare]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		expect(patch).not.toHaveBeenCalled();
		expect(report.inspected).toBe(1);
		expect(report.normalized).toEqual([{ id: 'obra', from: '2022-01-23', to: '2022-01-23T03:00:00.000Z' }]);
	});

	it('al aplicar persiste el instante completo, una vez por documento', async () => {
		const { writer, patch, set, commit } = spyWriter();

		await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[bare]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(patch).toHaveBeenCalledWith('obra');
		expect(set).toHaveBeenCalledWith({ publishedAt: '2022-01-23T03:00:00.000Z' });
		expect(commit).toHaveBeenCalledTimes(1);
	});

	it('omite el documento que ya trae hora, sin escribirlo', async () => {
		const { writer, patch } = spyWriter();

		const report = await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[{ _id: 'sana', publishedAt: '2022-02-01T01:18:27Z' }]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(patch).not.toHaveBeenCalled();
		expect(report.skipped).toEqual(['sana']);
		expect(report.normalized).toEqual([]);
	});

	it('recorre las páginas siguientes usando el _id del último elemento como cursor', async () => {
		const { writer } = spyWriter();
		const fetcher = new StubCandidatePageFetcher([[bare, { _id: 'otra' }], [bare]]);

		const report = await runPublishedAtNormalization({ fetcher, writer, apply: false, pageSize: 2 });

		expect(fetcher.cursors).toEqual(['', 'otra']);
		expect(report.inspected).toBe(3);
	});

	// Un documento roto no puede abortar la remediación del catálogo: se registra y el recorrido sigue.
	it('registra el documento con forma desconocida y continúa con el resto de la página', async () => {
		const { writer } = spyWriter();
		const rara = { _id: 'obra-rara', publishedAt: '2022-13-45' };

		const report = await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[rara, bare]]),
			writer,
			apply: false,
			pageSize: 3,
		});

		expect(report.failed).toHaveLength(1);
		expect(report.failed[0].id).toBe('obra-rara');
		expect(report.normalized.map((entry) => entry.id)).toEqual(['obra']);
	});
});

describe('formatPublishedAtNormalizationReport', () => {
	it('en seco cierra con el comando para persistir', async () => {
		const { writer } = spyWriter();
		const report = await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[bare]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		const lines = formatPublishedAtNormalizationReport(report, { apply: false });

		expect(lines.some((line) => line.includes('Se normalizarían: 1'))).toBe(true);
		expect(lines.at(-1)).toContain('--no-dry-run');
	});

	it('enumera los documentos fallidos con su motivo', async () => {
		const { writer } = spyWriter();
		const report = await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[{ _id: 'obra-rara', publishedAt: 'no-es-fecha' }]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		const lines = formatPublishedAtNormalizationReport(report, { apply: false });

		expect(lines.some((line) => line.includes('Fallidas: 1'))).toBe(true);
		expect(lines.some((line) => line.includes('obra-rara'))).toBe(true);
	});

	it('al aplicar no ofrece el comando y usa el tiempo pasado', async () => {
		const { writer } = spyWriter();
		const report = await runPublishedAtNormalization({
			fetcher: new StubCandidatePageFetcher([[bare]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		const lines = formatPublishedAtNormalizationReport(report, { apply: true });

		expect(lines.some((line) => line.includes('Normalizadas: 1'))).toBe(true);
		expect(lines.some((line) => line.includes('--no-dry-run'))).toBe(false);
	});
});
