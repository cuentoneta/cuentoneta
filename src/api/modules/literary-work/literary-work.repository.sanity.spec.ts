import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import {
	mixedMaterializationRawLiteraryWork,
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	onoffRawLiteraryWorksWithEpigraphs,
	onoffRawLiteraryWorksWithMultilineEpigraphs,
	onoffRawLiteraryWorksWithoutTags,
	onoffRawLiteraryWorksWithMediaSources,
	onoffRawLiteraryWorksWithTags,
	unmaterializedRawLiteraryWork,
} from '@mocks/onoff-raw-literary-works.mock';
import { onoffRawLiteraryWorksByAuthorMock } from '@mocks/onoff-raw-literary-works.mock';
import { onoffRawLiteraryWorksWithoutEditorialNote } from '@mocks/onoff-raw-literary-works.mock';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime, sumReadingTimes } from '@models/reading-time.model';
import { MalformedLiteraryWorkError } from './literary-work.errors';
import { literaryWorksByAuthorSlugQuery } from '../../_queries/literary-work.query';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';

// El repository solo hace `fetch` (sin escritura), así que el spy del client implementa solo eso; se
// inyecta por el seam del constructor. Cada test arma su propio repository con el crudo que devuelve.
function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

// Variante que también devuelve el spy, para los casos que afirman qué query se pidió.
function repoWith(raw: unknown) {
	const fetch = fn(() => Promise.resolve(raw));
	const repository = new SanityLiteraryWorkRepository({ fetch } as unknown as SanityClient);
	return { repository, fetch };
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

	// Fallback de reading time del read-path: cuando el crudo no está backfilleado (campos en null), el
	// repository deriva el valor por sección en lectura, sin escribir — el único que persiste el derivado
	// es el script de backfill. El escenario *stale* (un derivado persistido inconsistente con el
	// cuerpo actual) está fuera de alcance acá: el read-path sirve el total persistido tal cual (write-once
	// confía en el publish); detectarlo/re-materializarlo es responsabilidad del script de backfill.
	it('deriva el reading time por sección igual que deriveSectionReadingTime, sin escribir', async () => {
		const client = { fetch: fn(() => Promise.resolve(unmaterializedRawLiteraryWork)) } as unknown as SanityClient;
		const literaryWork = await new SanityLiteraryWorkRepository(client).fetchBySlug('el-odio');

		unmaterializedRawLiteraryWork.content.forEach((rawSection, index) => {
			expect(literaryWork?.content[index].readingTime).toBe(deriveSectionReadingTime(createMarkdown(rawSection.body)));
		});
		// El total sin persistir es la suma exacta de las secciones derivadas (mismo algoritmo del dominio).
		const expectedTotal = sumReadingTimes(
			unmaterializedRawLiteraryWork.content.map((rawSection) =>
				deriveSectionReadingTime(createMarkdown(rawSection.body)),
			),
		);
		expect(literaryWork?.totalReadingTime).toBe(expectedTotal);
		// El read-path solo lee: el stub del client únicamente implementa `fetch` (cualquier intento de
		// escritura lanzaría), y se lo invoca una sola vez.
		expect(client.fetch).toHaveBeenCalledTimes(1);
	});

	it('sirve el reading time persistido de una sección y deriva el de la sección en null (materialización mixta)', async () => {
		const literaryWork = await repoReturning(mixedMaterializationRawLiteraryWork).fetchBySlug('x');

		expect(literaryWork?.content[0].readingTime).toBe(7);
		const derivedSecond = deriveSectionReadingTime(createMarkdown(mixedMaterializationRawLiteraryWork.content[1].body));
		expect(literaryWork?.content[1].readingTime).toBe(derivedSecond);
		// El total sin persistir combina el valor materializado y el derivado, sin recalcular el primero.
		expect(literaryWork?.totalReadingTime).toBe(sumReadingTimes([createReadingTime(7), derivedSecond]));
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

	// Sin esta guarda, un canon que perdiera el epígrafe multilínea dejaría el it.each de abajo sin
	// casos y la suite pasaría en verde sin haber ejercitado nada.
	it('el corpus declara al menos un epígrafe cortado en varias líneas', () => {
		expect(onoffRawLiteraryWorksWithMultilineEpigraphs.length).toBeGreaterThan(0);
	});

	it.each(onoffRawLiteraryWorksWithMultilineEpigraphs)(
		'conserva el corte de línea del epígrafe al materializar el HTML (%#)',
		async (rawLiteraryWork) => {
			const literaryWork = await repoReturning(rawLiteraryWork).fetchBySlug(rawLiteraryWork.slug);

			// Crudo y dominio se aparean por posición dentro de la misma obra, así que el índice del
			// epígrafe cortado en el origen es el que hay que leer en el resultado del mapeo.
			const rawEpigraphs = rawLiteraryWork.content.flatMap((section) => section.epigraphs);
			const multilineIndex = rawEpigraphs.findIndex((epigraph) => epigraph.text?.includes('\n'));
			expect(multilineIndex).toBeGreaterThanOrEqual(0);

			const rawText = rawEpigraphs[multilineIndex].text ?? '';
			const mappedText = literaryWork?.content.flatMap((section) => section.epigraphs ?? [])[multilineIndex]?.text;

			// La aserción va en positivo y sobre palabras completas: solo puede pasar si el <br> quedó
			// exactamente donde el origen cortaba. Una negativa ("no quedaron pegadas") aprobaría igual
			// si el término construido para buscar nunca hubiera podido aparecer en el HTML.
			const [beforeBreak, afterBreak] = rawText.split('\n');
			const lastWord = /([\p{L}\p{N}]+)[^\p{L}\p{N}]*$/u.exec(beforeBreak)?.[1];
			const firstWord = /^[^\p{L}\p{N}]*([\p{L}\p{N}]+)/u.exec(afterBreak)?.[1];
			expect(lastWord).toBeDefined();
			expect(firstWord).toBeDefined();

			expect(mappedText).toMatch(new RegExp(`${lastWord}[^\\p{L}\\p{N}]*<br\\s*/?>[^\\p{L}\\p{N}]*${firstWord}`, 'u'));
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

	it('mapea las etiquetas de la obra a su modelo de dominio', async () => {
		const [rawLiteraryWork] = onoffRawLiteraryWorksWithTags;

		const literaryWork = await repoReturning(rawLiteraryWork).fetchBySlug(rawLiteraryWork.slug);

		expect(literaryWork?.tags.map((tag) => tag.slug)).toEqual(rawLiteraryWork.tags.map((raw) => raw.slug));
		expect(literaryWork?.tags.map((tag) => tag.title)).toEqual(rawLiteraryWork.tags.map((raw) => raw.title));
	});

	it('mapea a una lista vacía las etiquetas de una obra que no las tiene', async () => {
		const literaryWork = await repoReturning(onoffRawLiteraryWorksWithoutTags[0]).fetchBySlug('x');

		expect(literaryWork?.tags).toEqual([]);
	});

	// El ACL de multimedia lo comparten Story, Storylist y LiteraryWork, pero con todo el corpus crudo de
	// obras en `mediaSources: []` esta rama nunca se ejercitaba con datos.
	it('mapea los recursos multimedia de la obra, descartando los tipos que el dominio no modela', async () => {
		const [rawLiteraryWork] = onoffRawLiteraryWorksWithMediaSources;

		const literaryWork = await repoReturning(rawLiteraryWork).fetchBySlug(rawLiteraryWork.slug);

		const rawTypes = rawLiteraryWork.mediaSources.map((media) => media._type);
		expect(rawTypes).toContain('pdfLink');
		expect(literaryWork?.mediaSources.map((media) => media.type)).toEqual(
			rawTypes.filter((type) => type !== 'pdfLink'),
		);
	});

	// La proyección de obra literaria resuelve `audioUrl` dereferenciando el asset del archivo, igual que
	// la de Story: es lo que el dominio consume como `data.url` del space recording.
	it('resuelve la URL del audio en un space recording', async () => {
		const [rawLiteraryWork] = onoffRawLiteraryWorksWithMediaSources;
		const rawSpaceRecording = rawLiteraryWork.mediaSources.find((media) => media._type === 'spaceRecording');
		if (rawSpaceRecording?._type !== 'spaceRecording') throw new Error('el fixture no trae un space recording');

		const literaryWork = await repoReturning(rawLiteraryWork).fetchBySlug(rawLiteraryWork.slug);
		const spaceRecording = literaryWork?.mediaSources.find((media) => media.type === 'spaceRecording');

		expect((spaceRecording?.data as { url: string | null }).url).toBe(rawSpaceRecording.audioUrl);
	});

	it('devuelve null para un slug desconocido', async () => {
		expect(await repoReturning(null).fetchBySlug('no-existe')).toBeNull();
	});
});

describe('SanityLiteraryWorkRepository.fetchByAuthorSlug', () => {
	it('pide la query de listado por autor con el slug como parámetro', async () => {
		const { repository, fetch } = repoWith(onoffRawLiteraryWorksByAuthorMock);

		await repository.fetchByAuthorSlug('francois-onoff');

		expect(fetch).toHaveBeenCalledWith(literaryWorksByAuthorSlugQuery, { slug: 'francois-onoff' });
	});

	it.each(onoffRawLiteraryWorksByAuthorMock)('mapea el teaser de "$slug" a dominio congelado', async (rawTeaser) => {
		const [teaser] = await repoReturning([rawTeaser]).fetchByAuthorSlug('francois-onoff');

		expect(Object.isFrozen(teaser)).toBe(true);
		expect(teaser.slug).toBe(rawTeaser.slug);
		expect(teaser.totalReadingTime).toBe(rawTeaser.totalReadingTime);
		expect(teaser.sectionCount).toBe(rawTeaser.sectionCount);
	});

	it.each(onoffRawLiteraryWorksByAuthorMock)('sirve el extracto saneado de "$slug"', async (rawTeaser) => {
		const [teaser] = await repoReturning([rawTeaser]).fetchByAuthorSlug('francois-onoff');

		expect(teaser.excerpt.bodyHtml).toContain('<p>');
		// El extracto no transporta readingTime ni posición: no es una sección, es el arranque recortado.
		expect(teaser.excerpt).not.toHaveProperty('readingTime');
		expect(teaser.excerpt).not.toHaveProperty('position');
	});

	it.each(onoffRawLiteraryWorksByAuthorMock)(
		'angosta autores y medios a sus vistas de teaser en "$slug"',
		async (rawTeaser) => {
			const [teaser] = await repoReturning([rawTeaser]).fetchByAuthorSlug('francois-onoff');

			expect(teaser.authors[0]).not.toHaveProperty('biography');
			for (const media of teaser.mediaSources) {
				expect(Object.keys(media).sort()).toEqual(['title', 'type']);
			}
		},
	);

	it('lanza MalformedLiteraryWorkError ante una obra sin tiempo de lectura persistido', async () => {
		const [unbackfilled] = onoffRawLiteraryWorksByAuthorMock.map((work) => ({ ...work, totalReadingTime: null }));

		await expect(repoReturning([unbackfilled]).fetchByAuthorSlug('francois-onoff')).rejects.toThrow(
			MalformedLiteraryWorkError,
		);
	});

	it('lanza MalformedLiteraryWorkError ante un extracto sin cuerpo', async () => {
		const [first] = onoffRawLiteraryWorksByAuthorMock;
		const bodyless = { ...first, excerpt: [{ ...first.excerpt[0], body: null }] };

		await expect(repoReturning([bodyless]).fetchByAuthorSlug('francois-onoff')).rejects.toThrow(
			MalformedLiteraryWorkError,
		);
	});

	it('lanza MalformedLiteraryWorkError ante una obra sin sección de apertura', async () => {
		const [first] = onoffRawLiteraryWorksByAuthorMock;
		const sectionless = { ...first, excerpt: [] };

		await expect(repoReturning([sectionless]).fetchByAuthorSlug('francois-onoff')).rejects.toThrow(
			MalformedLiteraryWorkError,
		);
	});

	// Un listado que esconde el elemento roto es un bug de datos que nadie ve: se cae entero, con la
	// primera obra sana por delante para que no pase por casualidad.
	it('tumba el listado entero en vez de filtrar la obra rota', async () => {
		const [sane, broken, ...rest] = onoffRawLiteraryWorksByAuthorMock;

		await expect(
			repoReturning([sane, { ...broken, totalReadingTime: null }, ...rest]).fetchByAuthorSlug('francois-onoff'),
		).rejects.toThrow(MalformedLiteraryWorkError);
	});

	it('resuelve un listado vacío sin fallar', async () => {
		expect(await repoReturning([]).fetchByAuthorSlug('autor-sin-obras')).toEqual([]);
	});
});
