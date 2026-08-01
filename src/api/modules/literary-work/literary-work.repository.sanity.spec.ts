import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import {
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	onoffRawLiteraryWorksWithEpigraphs,
	unmaterializedRawLiteraryWork,
} from '@mocks/onoff-raw-literary-works.mock';
import { onoffRawLiteraryWorksWithoutEditorialNote } from '@mocks/onoff-raw-literary-works.mock';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';

// El repository solo hace `fetch` (sin escritura), así que el spy del client implementa solo eso; se
// inyecta por el seam del constructor. Cada test arma su propio repository con el crudo que devuelve.
function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

describe('SanityLiteraryWorkRepository.fetchBySlug', () => {
	it('mapea el crudo a un agregado congelado con posiciones y total persistido', async () => {
		const literaryWork = await repoReturning(multiSectionRawLiteraryWork).fetchBySlug(
			'el-palacio-de-las-nueve-fronteras',
		);

		expect(Object.isFrozen(literaryWork)).toBe(true);
		expect(literaryWork?.content.map((section) => section.position)).toEqual([0, 1]);
		expect(literaryWork?.sectionCount).toBe(2);
		expect(literaryWork?.totalReadingTime).toBe(12);
	});

	it('convierte el body por el pipeline de sanitización', async () => {
		const literaryWork = await repoReturning(onoffRawLiteraryWorksMock[0]).fetchBySlug('x');

		expect(literaryWork?.content[0].bodyHtml).toContain('<strong>');
		expect(literaryWork?.content[0].bodyHtml).not.toContain('**');
	});

	it('sirve el total persistido de una obra recitada tal cual (no lo recalcula del texto)', async () => {
		const literaryWork = await repoReturning({ ...onoffRawLiteraryWorksMock[0], totalReadingTime: 40 }).fetchBySlug(
			'x',
		);

		expect(literaryWork?.totalReadingTime).toBe(40);
	});

	it('deriva el reading time como fallback puro cuando la obra no está backfilleada (sin escribir)', async () => {
		const literaryWork = await repoReturning(unmaterializedRawLiteraryWork).fetchBySlug('el-odio');

		expect(literaryWork?.content.every((section) => section.readingTime >= 1)).toBe(true);
		expect(literaryWork?.totalReadingTime).toBeGreaterThanOrEqual(1);
	});

	it('mapea un coverImage ausente a string vacío', async () => {
		const literaryWork = await repoReturning({ ...onoffRawLiteraryWorksMock[0], coverImage: null }).fetchBySlug('x');

		expect(literaryWork?.coverImage).toBe('');
	});

	it.each(onoffRawLiteraryWorksWithEpigraphs)(
		'mapea el epígrafe crudo del corpus a HTML saneado (%#)',
		async (rawLiteraryWork) => {
			const literaryWork = await repoReturning(rawLiteraryWork).fetchBySlug(rawLiteraryWork.slug);

			const rawReference = rawLiteraryWork.content.find((section) => section.epigraphs.length > 0)?.epigraphs[0]
				?.reference;
			const mappedEpigraph = literaryWork?.content.find((section) => (section.epigraphs?.length ?? 0) > 0)
				?.epigraphs?.[0];

			// El texto en Markdown (`*…*`) sale como énfasis saneado; la referencia en texto plano sobrevive.
			expect(mappedEpigraph?.text).toContain('<em>');
			expect(mappedEpigraph?.text).not.toContain('*');
			expect(mappedEpigraph?.reference).toContain(rawReference ?? '');
		},
	);

	it('lanza ante un epígrafe sin texto (mapeo defensivo en la frontera)', async () => {
		const broken = {
			...onoffRawLiteraryWorksMock[0],
			content: [{ ...onoffRawLiteraryWorksMock[0].content[0], epigraphs: [{ text: null, reference: null }] }],
		};

		await expect(repoReturning(broken).fetchBySlug('x')).rejects.toThrow('Markdown inválido: contenido vacío');
	});

	it('convierte la nota editorial por el pipeline de sanitización', async () => {
		const literaryWork = await repoReturning(onoffRawLiteraryWorksMock[0]).fetchBySlug('x');

		expect(literaryWork?.editorialNote).toContain('<p>');
		expect(literaryWork?.editorialNote).not.toContain('**');
	});

	it('mapea a undefined la nota editorial de una obra que no la tiene', async () => {
		const literaryWork = await repoReturning(onoffRawLiteraryWorksWithoutEditorialNote[0]).fetchBySlug('x');

		expect(literaryWork?.editorialNote).toBeUndefined();
	});

	// Un coalesce a string vacío en la query haría lanzar a createMarkdown para toda obra sin nota:
	// la guarda por truthiness cubre el null y el vacío por igual.
	it('mapea a undefined una nota editorial vacía, sin lanzar', async () => {
		const literaryWork = await repoReturning({ ...onoffRawLiteraryWorksMock[0], editorialNote: '' }).fetchBySlug('x');

		expect(literaryWork?.editorialNote).toBeUndefined();
	});

	it('devuelve null para un slug desconocido', async () => {
		expect(await repoReturning(null).fetchBySlug('no-existe')).toBeNull();
	});
});
