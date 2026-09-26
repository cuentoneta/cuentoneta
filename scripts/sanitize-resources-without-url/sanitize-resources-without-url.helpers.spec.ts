import { fn } from '@test-utils';
import {
	formatResourceSanitizationReport,
	nextCursor,
	runResourceSanitization,
	sanitizedResources,
	type ResourceCandidate,
	type ResourceCandidatePageFetcher,
	type ResourceSanitizationWriter,
	type SanitizeCandidate,
} from './sanitize-resources-without-url.helpers';

class StubCandidatePageFetcher implements ResourceCandidatePageFetcher {
	public readonly cursors: string[] = [];

	constructor(private readonly pages: SanitizeCandidate[][]) {}

	public fetchPage(cursor: string): Promise<readonly SanitizeCandidate[]> {
		this.cursors.push(cursor);
		return Promise.resolve(this.pages[this.cursors.length - 1] ?? []);
	}
}

function spyWriter() {
	const commit = fn(() => Promise.resolve({}));
	const set = fn<(attributes: { readonly resources: readonly ResourceCandidate[] }) => { commit: typeof commit }>(
		() => ({ commit }),
	);
	const patch = fn<(documentId: string) => { set: typeof set }>(() => ({ set }));
	return { writer: { patch } as unknown as ResourceSanitizationWriter, patch, set, commit };
}

const completeResource = { _key: 'sano', url: 'https://es.wikipedia.org/wiki/Julio_Cort%C3%A1zar' };

describe('sanitizedResources', () => {
	it('completa la URL del recurso de un autor con artículo', () => {
		const sanitized = sanitizedResources({
			_id: 'author-1',
			_type: 'author',
			slug: 'neil-gaiman',
			resources: [{ _key: 'roto' }],
		});

		expect(sanitized).toEqual([{ _key: 'roto', url: 'https://es.wikipedia.org/wiki/Neil_Gaiman' }]);
	});

	it('borra el recurso del autor que no tiene artículo al que apuntar', () => {
		const sanitized = sanitizedResources({
			_id: 'author-2',
			_type: 'author',
			slug: 'anonimo',
			resources: [{ _key: 'roto' }],
		});

		expect(sanitized).toEqual([]);
	});

	// El campo llega `null` en las obras y ausente en los autores; ambas formas son el mismo hueco.
	it('trata una url nula igual que una ausente', () => {
		const sanitized = sanitizedResources({
			_id: 'obra-1',
			_type: 'literaryWork',
			slug: 'wakefield',
			resources: [{ _key: 'roto', url: null, title: 'Enlace a recurso original' }],
		});

		expect(sanitized).toEqual([]);
	});

	it('trata una url vacía igual que una ausente', () => {
		const sanitized = sanitizedResources({
			_id: 'author-1',
			_type: 'author',
			slug: 'neil-gaiman',
			resources: [{ _key: 'roto', url: '' }],
		});

		expect(sanitized).toEqual([{ _key: 'roto', url: 'https://es.wikipedia.org/wiki/Neil_Gaiman' }]);
	});

	it('conserva los recursos sanos del mismo documento', () => {
		const sanitized = sanitizedResources({
			_id: 'author-1',
			_type: 'author',
			slug: 'neil-gaiman',
			resources: [completeResource, { _key: 'roto' }],
		});

		expect(sanitized).toEqual([completeResource, { _key: 'roto', url: 'https://es.wikipedia.org/wiki/Neil_Gaiman' }]);
	});

	// Idempotencia: una segunda corrida no encuentra nada que sanear.
	it('devuelve null sobre un documento ya saneado', () => {
		expect(
			sanitizedResources({
				_id: 'author-1',
				_type: 'author',
				slug: 'neil-gaiman',
				resources: [completeResource],
			}),
		).toBeNull();
	});

	it('devuelve null sobre un documento sin recursos', () => {
		expect(sanitizedResources({ _id: 'author-3', _type: 'author', slug: 'julio-cortazar' })).toBeNull();
	});

	it('aborta ante un autor con un recurso sin URL que no figura en la tabla', () => {
		expect(() =>
			sanitizedResources({
				_id: 'author-9',
				_type: 'author',
				slug: 'autor-que-se-sumo-despues',
				resources: [{ _key: 'roto' }],
			}),
		).toThrow(/no figura en la tabla de disposición/);
	});

	it('aborta ante un autor sin slug', () => {
		expect(() => sanitizedResources({ _id: 'author-10', _type: 'author', resources: [{ _key: 'roto' }] })).toThrow(
			/no figura en la tabla de disposición/,
		);
	});

	// Una fila a medio completar es el estado normal apenas se agrega un ítem en el Studio: abortar por
	// eso detendría la corrida sobre el contenido publicado, que es lo que la remediación viene a sanear.
	it('saltea un autor en borrador fuera de la tabla, sin abortar', () => {
		expect(
			sanitizedResources({
				_id: 'drafts.author-11',
				_type: 'author',
				slug: 'autor-a-medio-cargar',
				resources: [{ _key: 'roto' }],
			}),
		).toBeNull();
	});

	it('aborta ante un autor con más recursos incompletos que los que la tabla puede completar', () => {
		expect(() =>
			sanitizedResources({
				_id: 'author-1',
				_type: 'author',
				slug: 'neil-gaiman',
				resources: [{ _key: 'roto-1' }, { _key: 'roto-2' }],
			}),
		).toThrow(/la tabla asigna una sola/);
	});

	// La disposición de borrar se apoya en que el recurso no nombra ningún destino averiguable. Un
	// título distinto es otro caso, y borrarlo sería destruir un dato que nadie evaluó.
	it('aborta ante una obra con un recurso sin URL de título ajeno al lote', () => {
		expect(() =>
			sanitizedResources({
				_id: 'obra-9',
				_type: 'literaryWork',
				slug: 'una-obra',
				resources: [{ _key: 'roto', title: 'Entrevista al autor en un pódcast' }],
			}),
		).toThrow(/ajeno al lote/);
	});

	it('completa el protocolo de una URL cargada sin esquema', () => {
		const sanitized = sanitizedResources({
			_id: 'author-12',
			_type: 'author',
			slug: 'la-conspiracion-de-los-fuleros',
			resources: [{ _key: 'sin-esquema', url: 'instagram.com/conspiraciondelosfuleros', title: 'Perfil' }],
		});

		expect(sanitized).toEqual([
			{ _key: 'sin-esquema', url: 'https://instagram.com/conspiraciondelosfuleros', title: 'Perfil' },
		]);
	});

	it('no toca una URL con esquema que no figura entre las conocidas', () => {
		expect(
			sanitizedResources({
				_id: 'author-13',
				_type: 'author',
				slug: 'un-autor',
				resources: [{ _key: 'contacto', url: 'mailto:autor@example.com' }],
			}),
		).toBeNull();
	});
});

describe('nextCursor', () => {
	const candidate = { _id: 'author-1', _type: 'author' };

	it('devuelve el _id del último elemento cuando la página vino completa', () => {
		expect(nextCursor([candidate, { _id: 'author-2', _type: 'author' }], 2)).toBe('author-2');
	});

	it('devuelve null cuando la página vino corta', () => {
		expect(nextCursor([candidate], 2)).toBeNull();
	});

	it('devuelve null cuando la página vino vacía', () => {
		expect(nextCursor([], 2)).toBeNull();
	});
});

describe('runResourceSanitization', () => {
	const broken = {
		_id: 'author-1',
		_type: 'author',
		slug: 'neil-gaiman',
		resources: [{ _key: 'roto' }],
	};

	it('en seco reporta lo que sanearía sin escribir', async () => {
		const { writer, patch } = spyWriter();

		const report = await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([[broken]]),
			writer,
			apply: false,
			pageSize: 2,
		});

		expect(patch).not.toHaveBeenCalled();
		expect(report.inspected).toBe(1);
		expect(report.sanitized).toEqual(['author-1']);
	});

	it('al aplicar persiste los recursos saneados, una vez por documento', async () => {
		const { writer, patch, set, commit } = spyWriter();

		await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([[broken]]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(patch).toHaveBeenCalledWith('author-1');
		expect(set).toHaveBeenCalledWith({
			resources: [{ _key: 'roto', url: 'https://es.wikipedia.org/wiki/Neil_Gaiman' }],
		});
		expect(commit).toHaveBeenCalledTimes(1);
	});

	it('omite el documento ya saneado, sin escribirlo', async () => {
		const { writer, patch } = spyWriter();

		const report = await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([
				[{ _id: 'sano', _type: 'author', slug: 'x', resources: [completeResource] }],
			]),
			writer,
			apply: true,
			pageSize: 2,
		});

		expect(patch).not.toHaveBeenCalled();
		expect(report.skipped).toEqual(['sano']);
		expect(report.sanitized).toEqual([]);
	});

	it('recorre las páginas siguientes usando el _id del último elemento como cursor', async () => {
		const { writer } = spyWriter();
		const fetcher = new StubCandidatePageFetcher([[broken, { ...broken, _id: 'author-2' }], [broken]]);

		const report = await runResourceSanitization({ fetcher, writer, apply: false, pageSize: 2 });

		expect(fetcher.cursors).toEqual(['', 'author-2']);
		expect(report.inspected).toBe(3);
	});

	// Un documento roto no puede abortar el saneamiento del catálogo: se registra y el recorrido sigue.
	it('registra el documento sin disposición y continúa con el resto de la página', async () => {
		const { writer } = spyWriter();
		const unknown = {
			_id: 'author-9',
			_type: 'author',
			slug: 'autor-que-se-sumo-despues',
			resources: [{ _key: 'roto' }],
		};

		const report = await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([[unknown, broken]]),
			writer,
			apply: false,
			pageSize: 3,
		});

		expect(report.failed).toHaveLength(1);
		expect(report.failed[0].id).toBe('author-9');
		expect(report.sanitized).toEqual(['author-1']);
	});
});

describe('formatResourceSanitizationReport', () => {
	it('en seco cierra con el comando para persistir', async () => {
		const { writer } = spyWriter();
		const report = await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([
				[{ _id: 'author-1', _type: 'author', slug: 'neil-gaiman', resources: [{ _key: 'roto' }] }],
			]),
			writer,
			apply: false,
			pageSize: 2,
		});

		const lines = formatResourceSanitizationReport(report, { apply: false });

		expect(lines.some((line) => line.includes('Se sanearían: 1'))).toBe(true);
		expect(lines.at(-1)).toContain('--no-dry-run');
	});

	it('enumera los documentos fallidos con su motivo', async () => {
		const { writer } = spyWriter();
		const report = await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([
				[{ _id: 'author-9', _type: 'author', slug: 'desconocido', resources: [{ _key: 'roto' }] }],
			]),
			writer,
			apply: false,
			pageSize: 2,
		});

		const lines = formatResourceSanitizationReport(report, { apply: false });

		expect(lines.some((line) => line.includes('Fallidos: 1'))).toBe(true);
		expect(lines.some((line) => line.includes('author-9'))).toBe(true);
	});

	it('al aplicar no ofrece el comando y usa el tiempo pasado', async () => {
		const { writer } = spyWriter();
		const report = await runResourceSanitization({
			fetcher: new StubCandidatePageFetcher([
				[{ _id: 'author-1', _type: 'author', slug: 'neil-gaiman', resources: [{ _key: 'roto' }] }],
			]),
			writer,
			apply: true,
			pageSize: 2,
		});

		const lines = formatResourceSanitizationReport(report, { apply: true });

		expect(lines.some((line) => line.includes('Saneados: 1'))).toBe(true);
		expect(lines.some((line) => line.includes('--no-dry-run'))).toBe(false);
	});
});
