import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import {
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	unmaterializedRawLiteraryWork,
} from '@mocks/onoff-raw-literary-works.mock';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';

// El repository solo hace `fetch` (sin escritura), así que el spy del client implementa solo eso; se
// inyecta por el seam del constructor. Cada test arma su propio repository con el crudo que devuelve.
function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

describe('SanityLiteraryWorkRepository.fetchBySlug', () => {
	it('mapea el crudo a un agregado congelado con posiciones y total persistido', async () => {
		const work = await repoReturning(multiSectionRawLiteraryWork).fetchBySlug('el-palacio-de-las-nueve-fronteras');

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

	it('deriva el reading time como fallback puro cuando la obra no está backfilleada (sin escribir)', async () => {
		const work = await repoReturning(unmaterializedRawLiteraryWork).fetchBySlug('el-odio');

		expect(work?.content.every((section) => section.readingTime >= 1)).toBe(true);
		expect(work?.totalReadingTime).toBeGreaterThanOrEqual(1);
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

	it('devuelve null para un slug desconocido', async () => {
		expect(await repoReturning(null).fetchBySlug('no-existe')).toBeNull();
	});
});
