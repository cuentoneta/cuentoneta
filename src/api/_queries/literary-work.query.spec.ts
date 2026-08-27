import { evaluate, parse } from 'groq-js';

import {
	onoffAuthorDocumentsMock,
	onoffDatasetMock,
	onoffLiteraryWorkDocumentsMock,
} from '@mocks/onoff-documents.mock';

import { literaryWorkTeasers } from './literary-work.query';

async function run(query: string, dataset: unknown[], params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset, params });
	return result.get();
}

const dataset = onoffDatasetMock;
const [onoffAuthor] = onoffAuthorDocumentsMock;
const authorSlug = onoffAuthor.slug.current;

describe('literaryWorkTeasers', () => {
	it('should return the whole catalog when no author filter is given', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: null, slugs: null });

		expect(works).toHaveLength(onoffLiteraryWorkDocumentsMock.length);
	});

	it('should return the works of the author when filtered', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: authorSlug, slugs: null });

		expect(works.length).toBeGreaterThan(0);
		works.forEach((work: { authors: { slug: string }[] }) => {
			expect(work.authors.some(({ slug }) => slug === authorSlug)).toBe(true);
		});
	});

	it('should return an empty list for an author that has no works', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: 'un-autor-que-no-existe', slugs: null });

		expect(works).toEqual([]);
	});

	// El listado no se acota: quién elige las tres que se muestran es del consumidor, así que la query
	// tiene que traer todas. Un slice acá volvería el criterio de selección un detalle del transporte.
	it('should not cap the listing', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: authorSlug, slugs: null });

		expect(works.length).toBeGreaterThan(3);
	});

	it('should order the listing by title', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: authorSlug, slugs: null });

		const titles = works.map(({ title }: { title: string }) => title);
		expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
	});

	// El extracto viaja recortado al arranque de la sección de apertura: la tarjeta lo pinta con un
	// recorte por líneas, así que traer la sección entera transportaría la obra completa de cada una
	// del listado para mostrar dos renglones.
	it('should project a trimmed excerpt instead of the whole opening section', async () => {
		const [work] = await run(literaryWorkTeasers, dataset, { author: authorSlug, slugs: null });
		const [excerpt] = work.excerpt;
		const [document] = onoffLiteraryWorkDocumentsMock.filter(({ slug }) => slug.current === work.slug);
		const [openingSection] = document.content;

		expect(excerpt.body.length).toBeLessThan(openingSection.body.length);
		expect(openingSection.body.startsWith(excerpt.body)).toBe(true);
	});

	// El lote se pide desordenado a propósito: el filtro es de pertenencia y entrega en orden de
	// documento, así que una implementación que devolviera el orden pedido no podría pasar. Quien
	// necesite ese orden lo repone del lado del consumidor.
	it('should return the batch of works in document order, not in the order asked for', async () => {
		const catalog = await run(literaryWorkTeasers, dataset, { author: null, slugs: null });
		const [first, , third] = catalog;

		const works = await run(literaryWorkTeasers, dataset, { author: null, slugs: [third.slug, first.slug] });

		expect(works.map(({ slug }: { slug: string }) => slug)).toEqual([first.slug, third.slug]);
	});

	it('should ignore a slug that matches no work', async () => {
		const [first] = await run(literaryWorkTeasers, dataset, { author: null, slugs: null });

		const works = await run(literaryWorkTeasers, dataset, { author: null, slugs: [first.slug, 'no-existe'] });

		expect(works.map(({ slug }: { slug: string }) => slug)).toEqual([first.slug]);
	});

	// Los dos criterios se acumulan en vez de reemplazarse: un slug que existe, pedido bajo un autor que
	// no lo escribió, no lo trae. Sin esto, una implementación que aplicara solo el último filtro pasaría.
	it('should intersect the author and slug filters', async () => {
		const [first] = await run(literaryWorkTeasers, dataset, { author: null, slugs: null });

		const works = await run(literaryWorkTeasers, dataset, {
			author: 'un-autor-que-no-existe',
			slugs: [first.slug],
		});

		expect(works).toEqual([]);
	});

	it('should leave drafts out', async () => {
		const draft = { ...onoffLiteraryWorkDocumentsMock[0], _id: 'drafts.una-obra-en-borrador' };

		const works = await run(literaryWorkTeasers, [...dataset, draft], { author: null, slugs: null });

		expect(works.every(({ _id }: { _id: string }) => !_id.startsWith('drafts.'))).toBe(true);
	});
});
