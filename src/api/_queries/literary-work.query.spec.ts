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
		const works = await run(literaryWorkTeasers, dataset, { author: null });

		expect(works).toHaveLength(onoffLiteraryWorkDocumentsMock.length);
	});

	it('should return the works of the author when filtered', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: authorSlug });

		expect(works.length).toBeGreaterThan(0);
		works.forEach((work: { authors: { slug: string }[] }) => {
			expect(work.authors.some(({ slug }) => slug === authorSlug)).toBe(true);
		});
	});

	it('should return an empty list for an author that has no works', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: 'un-autor-que-no-existe' });

		expect(works).toEqual([]);
	});

	// El listado no se acota: quién elige las tres que se muestran es del consumidor, así que la query
	// tiene que traer todas. Un slice acá volvería el criterio de selección un detalle del transporte.
	it('should not cap the listing', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: authorSlug });

		expect(works.length).toBeGreaterThan(3);
	});

	it('should order the listing by title', async () => {
		const works = await run(literaryWorkTeasers, dataset, { author: authorSlug });

		const titles = works.map(({ title }: { title: string }) => title);
		expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
	});

	// El extracto viaja recortado al arranque de la sección de apertura: la tarjeta lo pinta con un
	// recorte por líneas, así que traer la sección entera transportaría la obra completa de cada una
	// del listado para mostrar dos renglones.
	it('should project a trimmed excerpt instead of the whole opening section', async () => {
		const [work] = await run(literaryWorkTeasers, dataset, { author: authorSlug });
		const [excerpt] = work.excerpt;
		const [document] = onoffLiteraryWorkDocumentsMock.filter(({ slug }) => slug.current === work.slug);
		const [openingSection] = document.content;

		expect(excerpt.body.length).toBeLessThan(openingSection.body.length);
		expect(openingSection.body.startsWith(excerpt.body)).toBe(true);
	});

	it('should leave drafts out', async () => {
		const draft = { ...onoffLiteraryWorkDocumentsMock[0], _id: 'drafts.una-obra-en-borrador' };

		const works = await run(literaryWorkTeasers, [...dataset, draft], { author: null });

		expect(works.every(({ _id }: { _id: string }) => !_id.startsWith('drafts.'))).toBe(true);
	});
});
