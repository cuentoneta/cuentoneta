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
import {
	onoffRawLiteraryWorksWithoutEditorialNote,
	onoffRawLiteraryWorkTeasersMock,
} from '@mocks/onoff-raw-literary-works.mock';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime, sumReadingTimes } from '@models/reading-time.model';
import { MalformedLiteraryWorkError } from './literary-work.errors';
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

	// El dato que no entra al dominio existió: obras con la fecha de publicación sin hora, que el value
	// object rechaza. Sobre una lectura puntual, el error crudo dice qué campo falló pero no de qué obra.
	it('nombra la obra cuando el crudo no se puede traducir', async () => {
		const repository = repoReturning({ ...onoffRawLiteraryWorksMock[0], publishedAt: '2022-01-23' });

		await expect(repository.fetchBySlug('una-venganza')).rejects.toThrow(MalformedLiteraryWorkError);
		await expect(repository.fetchBySlug('una-venganza')).rejects.toThrow('una-venganza');
	});

	it('preserva la causa original del rechazo', async () => {
		const repository = repoReturning({ ...onoffRawLiteraryWorksMock[0], publishedAt: '2022-01-23' });

		const error = await repository.fetchBySlug('una-venganza').catch((thrown: unknown) => thrown);

		expect((error as MalformedLiteraryWorkError).cause).toBeInstanceOf(Error);
		expect(String((error as MalformedLiteraryWorkError).cause)).toContain('2022-01-23');
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

		// El rechazo viaja envuelto en el error del agregado, que nombra la obra; el motivo concreto
		// queda en la causa, que es donde se lee qué campo lo produjo.
		const error = await repoReturning(broken)
			.fetchBySlug('x')
			.catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(MalformedLiteraryWorkError);
		expect(String((error as MalformedLiteraryWorkError).cause)).toContain('Markdown inválido: contenido vacío');
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

describe('SanityLiteraryWorkRepository.fetchTeasers', () => {
	it('mapea el listado a teasers congelados con el extracto saneado', async () => {
		const { literaryWorks, malformed } = await repoReturning(onoffRawLiteraryWorkTeasersMock).fetchTeasers({});

		expect(literaryWorks).toHaveLength(onoffRawLiteraryWorkTeasersMock.length);
		expect(malformed).toEqual([]);
		literaryWorks.forEach((teaser) => {
			expect(Object.isFrozen(teaser)).toBe(true);
			expect(teaser.excerpt.bodyHtml).not.toContain('**');
		});
	});

	it('devuelve un listado vacío para un autor sin obras', async () => {
		const { literaryWorks, malformed } = await repoReturning([]).fetchTeasers({ author: 'sin-obras' });

		expect(literaryWorks).toEqual([]);
		expect(malformed).toEqual([]);
	});

	// El mapeo por obra falla rápido, pero la obra que no se puede traducir se reporta en vez de
	// propagarse: qué hacer con ella lo decide quien conoce el caso de uso, no este adaptador.
	it('reporta la obra mal curada sin llevarse puestas a las demás', async () => {
		const [sane, ...rest] = onoffRawLiteraryWorkTeasersMock;
		const broken = { ...sane, _id: `${sane._id}-rota`, slug: `${sane.slug}-rota`, totalReadingTime: null };

		const { literaryWorks, malformed } = await repoReturning([broken, ...rest]).fetchTeasers({});

		expect(literaryWorks).toHaveLength(rest.length);
		expect(malformed).toHaveLength(1);
		expect(malformed[0].slug).toBe(broken.slug);
	});

	it('reporta como mal curada a la obra sin sección de apertura', async () => {
		const [sane] = onoffRawLiteraryWorkTeasersMock;
		const excerptless = { ...sane, excerpt: [] };

		const { literaryWorks, malformed } = await repoReturning([excerptless]).fetchTeasers({});

		expect(literaryWorks).toEqual([]);
		expect(malformed[0]).toBeInstanceOf(MalformedLiteraryWorkError);
	});
});
