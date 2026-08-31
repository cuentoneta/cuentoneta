import {
	onoffLiteraryWorkNavigationTeasersMock,
	onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
	onoffLiteraryWorkTeasersMock,
	onoffLiteraryWorkTeasersWithExcerptMock,
	onoffLiteraryWorkTeasersWithMediaSources,
	onoffLiteraryWorkTeasersWithMediaSourcesMock,
} from './onoff-literary-work-teasers.mock';
import { palacioNueveFronterasLiteraryWorkTeaserMock } from './onoff/literary-work/literary-work-teasers.mock';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.literary-work.mock';

describe('onoffLiteraryWorkTeasersMock (derivación de teasers desde LiteraryWork)', () => {
	// El extracto conserva el título de la sección de apertura pero recorta su cuerpo, espejando lo que
	// hace la query. Se afirma que es un prefijo estricto: igualarlo al cuerpo entero volvería a pasar
	// si el recorte dejara de aplicarse, y ninguna otra aserción lo notaría.
	it('should derive the excerpt from the opening of the source work, truncated', () => {
		const opening = palacioNueveFronterasLiteraryWorkMock.content[0];
		const { excerpt } = palacioNueveFronterasLiteraryWorkTeaserMock;

		expect(excerpt.title).toEqual(opening.title);
		expect(excerpt.bodyHtml.length).toBeLessThan(opening.bodyHtml.length);
		expect(opening.bodyHtml.startsWith(excerpt.bodyHtml)).toBe(true);
	});

	it('should carry a rendered bodyHtml in the excerpt', () => {
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser.excerpt.bodyHtml).toContain('<p>');
		}
	});

	it('should summarize authors (at least one author teaser)', () => {
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser.authors.length).toBeGreaterThan(0);
		}
	});

	// Un selector vacío no rompe a su consumidor: lo deja desestructurando `undefined`. La guarda vive
	// acá una vez, y no repetida en cada spec que toma el primer elemento.
	it('exposes a non-empty fixture for every capability selector', () => {
		const selectorsByName = {
			onoffLiteraryWorkTeasersWithExcerptMock,
			onoffLiteraryWorkTeasersWithMediaSources,
			onoffLiteraryWorkTeasersWithMediaSourcesMock,
		};

		Object.entries(selectorsByName).forEach(([name, selector]) => {
			expect(selector, name).not.toHaveLength(0);
		});
	});

	// Los dos nombres se parecen y los conjuntos no: el enriquecido cubre todo el canon y el filtrado
	// solo las obras que declaran medios por sí mismas. Si dejaran de distinguirse, elegir uno u otro
	// pasaría a dar lo mismo y un caso podría afirmar sobre el conjunto equivocado sin notarlo.
	it('keeps the enriched media selector wider than the filtered one', () => {
		expect(onoffLiteraryWorkTeasersWithMediaSources.length).toBeLessThan(
			onoffLiteraryWorkTeasersWithMediaSourcesMock.length,
		);
	});

	it('should not carry the full-view fields (content, resources, dates)', () => {
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser).not.toHaveProperty('content');
			expect(teaser).not.toHaveProperty('resources');
			expect(teaser).not.toHaveProperty('originalPublication');
			expect(teaser).not.toHaveProperty('publishedAt');
		}
	});
});

describe('navigation teasers de LiteraryWork (proyección de la vista base)', () => {
	// El .map preserva el orden, así que el teaser en el índice i deriva de onoffLiteraryWorksMock[i].
	it('should preserve the base-view fields from the source work', () => {
		onoffLiteraryWorkNavigationTeasersMock.forEach((teaser, index) => {
			const source = onoffLiteraryWorksMock[index];
			expect(teaser._id).toBe(source._id);
			expect(teaser.slug).toBe(source.slug);
			expect(teaser.title).toBe(source.title);
			expect(teaser.coverImage).toBe(source.coverImage);
			expect(teaser.totalReadingTime).toBe(source.totalReadingTime);
			expect(teaser.sectionCount).toBe(source.sectionCount);
			expect(teaser.tags).toBe(source.tags);
			// mediaSources no se transporta por referencia: la vista de navegación promete el tag y el
			// título, no la carga con la que se reproduce el recurso.
			expect(teaser.mediaSources).toEqual(
				source.mediaSources.map((media) => ({ type: media.type, title: media.title })),
			);
		});
	});

	it('should leave authors empty in the plain navigation teaser', () => {
		for (const teaser of onoffLiteraryWorkNavigationTeasersMock) {
			expect(teaser.authors).toHaveLength(0);
		}
	});

	it('should summarize the source work authors to AuthorTeaser in the with-authors variant', () => {
		onoffLiteraryWorkNavigationTeasersWithAuthorsMock.forEach((teaser, index) => {
			const source = onoffLiteraryWorksMock[index];
			// Los autores derivan de la obra fuente (no de un mock fijo), preservando slug y nombre...
			expect(teaser.authors.map((author) => author.slug)).toEqual(source.authors.map((author) => author.slug));
			expect(teaser.authors[0].name).toBe(source.authors[0].name);
			// ...pero la variante AuthorTeaser no declara la biografía y vacía los recursos.
			expect(teaser.authors[0]).not.toHaveProperty('biography');
			expect(teaser.authors[0].resources).toHaveLength(0);
		});
	});

	it('should not carry full-view, paratext nor teaser fields', () => {
		for (const teaser of [
			...onoffLiteraryWorkNavigationTeasersMock,
			...onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
		]) {
			expect(teaser).not.toHaveProperty('content');
			expect(teaser).not.toHaveProperty('resources');
			expect(teaser).not.toHaveProperty('originalPublication');
			expect(teaser).not.toHaveProperty('publishedAt');
			expect(teaser).not.toHaveProperty('editorialNote');
			expect(teaser).not.toHaveProperty('excerpt');
		}
	});
});
