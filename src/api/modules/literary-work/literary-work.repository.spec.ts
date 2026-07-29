import type { SanityClient } from '@sanity/client';
import { clearAllMocks, fn, type Mock } from '@test-utils';
import {
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	unmaterializedRawLiteraryWork,
} from '@mocks/onoff-raw-literary-works.mock';
import { SanityLiteraryWorkRepository } from './literary-work.repository';
import { LiteraryWorkSectionNotFoundError } from './literary-work.errors';

interface SpyClient {
	client: SanityClient;
	fetch: Mock;
	patch: Mock;
	setIfMissing: Mock;
	commit: Mock;
}

// Spy inyectado por el seam del constructor: implementa solo `fetch` y la cadena `patch → setIfMissing
// → commit` que el repository ejerce; el resto del contrato de SanityClient no interviene.
function createSpyClient(): SpyClient {
	const commit = fn(() => Promise.resolve({}));
	const setIfMissing = fn(() => ({ commit }));
	const patch = fn(() => ({ setIfMissing }));
	const fetch = fn();
	const client = { fetch, patch } as unknown as SanityClient;
	return { client, fetch, patch, setIfMissing, commit };
}

const sectionReadingTimeKey = (key: string) => `content[_key=="${key}"].readingTime`;

// Obra multi-sección sin materializar, compuesta del corpus (el corpus solo trae la versión de 1
// sección `el-odio`): dos secciones sin total ni readingTime, para ejercitar el cold-start parcial.
const coldMultiSectionRaw = {
	...multiSectionRawLiteraryWork,
	totalReadingTime: null,
	content: multiSectionRawLiteraryWork.content.map((section) => ({ ...section, readingTime: null })),
};

describe('SanityLiteraryWorkRepository', () => {
	// Cada test crea su spy fresco con createSpyClient(), así que no hay estado compartido; el reset
	// es higiene alineada con la convención del repo (testing.md).
	beforeEach(clearAllMocks);

	describe('fetchBySlug — materialización write-on-read', () => {
		it('persists the missing reading times (setIfMissing) and serves the computed values', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(unmaterializedRawLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchBySlug('el-odio');

			expect(spy.patch).toHaveBeenCalledWith('onoff-literary-work-el-odio-sin-materializar');
			const attributes = spy.setIfMissing.mock.calls[0][0] as Record<string, number>;
			expect(Object.keys(attributes)).toContain('totalReadingTime');
			expect(Object.keys(attributes)).toContain(sectionReadingTimeKey('section-1'));
			expect(spy.commit).toHaveBeenCalledTimes(1);
			expect(work?.totalReadingTime).toBe(work?.content.reduce((sum: number, section) => sum + section.readingTime, 0));
		});

		it('coalesces concurrent materializations of the same work into a single write', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(unmaterializedRawLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			// Ráfaga concurrente sobre la misma obra sin materializar: mientras la primera escritura está
			// en vuelo, las demás sirven lo derivado sin re-escribir (guard a nivel de módulo).
			await Promise.all([
				repository.fetchBySlug('el-odio'),
				repository.fetchBySlug('el-odio'),
				repository.fetchBySlug('el-odio'),
			]);

			expect(spy.patch).toHaveBeenCalledTimes(1);
		});

		it('does not write when the reading times are already persisted', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(multiSectionRawLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			await repository.fetchBySlug('el-palacio-de-las-nueve-fronteras');

			expect(spy.patch).not.toHaveBeenCalled();
		});

		it('degrades to compute-without-persist when there is no write token', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(unmaterializedRawLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, false);

			const work = await repository.fetchBySlug('el-odio');

			expect(spy.patch).not.toHaveBeenCalled();
			expect(work?.content.every((section) => section.readingTime >= 1)).toBe(true);
		});

		it('skips the write (without throwing) when a section _key is unsafe to interpolate', async () => {
			const broken = {
				...unmaterializedRawLiteraryWork,
				content: [{ ...unmaterializedRawLiteraryWork.content[0], _key: 'bad key!' }],
			};
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(broken);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchBySlug('el-odio');

			expect(spy.patch).not.toHaveBeenCalled();
			expect(work).not.toBeNull();
		});

		it('returns null for an unknown slug', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(null);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			expect(await repository.fetchBySlug('no-existe')).toBeNull();
		});
	});

	describe('fetchSectionBySlug — proyección parcial', () => {
		it('projects the requested section with whole-work metadata in a single query', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue({
				...multiSectionRawLiteraryWork,
				section: [multiSectionRawLiteraryWork.content[1]],
			});
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchSectionBySlug('el-palacio-de-las-nueve-fronteras', 1);

			expect(work?.content).toHaveLength(1);
			expect(work?.content[0].position).toBe(1);
			expect(work?.sectionCount).toBe(2);
			expect(work?.totalReadingTime).toBe(12);
			expect(spy.fetch).toHaveBeenCalledTimes(1);
		});

		it('falls back to a full fetch to materialize on cold-start (no persisted total)', async () => {
			const coldSection = { ...coldMultiSectionRaw, section: [coldMultiSectionRaw.content[1]] };
			const spy = createSpyClient();
			spy.fetch.mockResolvedValueOnce(coldSection).mockResolvedValueOnce(coldMultiSectionRaw);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchSectionBySlug('el-palacio-de-las-nueve-fronteras', 1);

			expect(spy.fetch).toHaveBeenCalledTimes(2);
			expect(work?.content).toHaveLength(1);
			expect(work?.content[0].position).toBe(1);
		});

		it('throws LiteraryWorkSectionNotFoundError when the section is out of range', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue({ ...multiSectionRawLiteraryWork, section: [] });
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			await expect(repository.fetchSectionBySlug('el-palacio-de-las-nueve-fronteras', 99)).rejects.toThrow(
				LiteraryWorkSectionNotFoundError,
			);
		});

		it('returns null for an unknown slug', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(null);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			expect(await repository.fetchSectionBySlug('no-existe', 0)).toBeNull();
		});
	});

	describe('traducción raw → dominio (ACL del repository)', () => {
		// canPersist false: estos casos ejercen solo la traducción, no el write-on-read.
		function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(raw);
			return new SanityLiteraryWorkRepository(spy.client, false);
		}

		it('mapea el crudo a un agregado congelado con posiciones y total persistido', async () => {
			const work = await repoReturning(multiSectionRawLiteraryWork).fetchBySlug('x');

			expect(Object.isFrozen(work)).toBe(true);
			expect(work?.content.map((section) => section.position)).toEqual([0, 1]);
			expect(work?.sectionCount).toBe(2);
			expect(work?.totalReadingTime).toBe(12);
		});

		it('convierte el body por el pipeline de sanitización', async () => {
			const work = await repoReturning(onoffRawLiteraryWorksMock[0]).fetchBySlug('x');

			expect(work?.content[0].bodyHtml).toContain('<strong>');
			expect(work?.content[0].bodyHtml).not.toContain('**');
		});

		it('sirve el total persistido de una obra recitada tal cual (no lo recalcula del texto)', async () => {
			const work = await repoReturning({ ...onoffRawLiteraryWorksMock[0], totalReadingTime: 40 }).fetchBySlug('x');

			expect(work?.totalReadingTime).toBe(40);
		});

		it('mapea un coverImage ausente a string vacío', async () => {
			const work = await repoReturning({ ...onoffRawLiteraryWorksMock[0], coverImage: null }).fetchBySlug('x');

			expect(work?.coverImage).toBe('');
		});

		it('lanza ante un epígrafe sin texto (mapeo defensivo en la frontera)', async () => {
			const broken = {
				...onoffRawLiteraryWorksMock[0],
				content: [{ ...onoffRawLiteraryWorksMock[0].content[0], epigraphs: [{ text: null, reference: null }] }],
			};

			await expect(repoReturning(broken).fetchBySlug('x')).rejects.toThrow('Markdown inválido: contenido vacío');
		});

		it('corre las invariantes de metadata también por la vía parcial ?section=N (título vacío)', async () => {
			const projection = {
				...multiSectionRawLiteraryWork,
				section: [multiSectionRawLiteraryWork.content[0]],
				title: '   ',
			};

			await expect(repoReturning(projection).fetchSectionBySlug('x', 0)).rejects.toThrow('título vacío');
		});

		it('corre las invariantes de metadata también por la vía parcial ?section=N (sin autores)', async () => {
			const projection = {
				...multiSectionRawLiteraryWork,
				section: [multiSectionRawLiteraryWork.content[0]],
				authors: [],
			};

			await expect(repoReturning(projection).fetchSectionBySlug('x', 0)).rejects.toThrow('sin autores');
		});
	});
});
