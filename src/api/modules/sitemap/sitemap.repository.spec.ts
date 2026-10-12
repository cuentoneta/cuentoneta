import { evaluate, parse } from 'groq-js';
import { type Mock } from '@test-utils';
import {
	onoffAuthorDocumentsMock,
	onoffCollectionDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
} from '@mocks/onoff-documents.mock';
import { isSlug } from '@models/slug.model';
import { sitemapSlugsQuery } from '@queries/sitemap.query';
import { client } from '../../_helpers/sanity-connector';
import { fetchSitemapSlugs } from './sitemap.repository';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del cliente de Sanity; se migra a inyección de dependencias en #1503 */
vi.mock('../../_helpers/sanity-connector', () => ({ client: { fetch: vi.fn() } }));
/* eslint-enable no-restricted-syntax */

const [canonLiteraryWork] = onoffLiteraryWorkDocumentsMock;
const [canonAuthor] = onoffAuthorDocumentsMock;
const [canonCollection] = onoffCollectionDocumentsMock;

// Slugs que la poda de la query no ve, porque GROQ no puede expresar el alfabeto del slug.
const OUTSIDE_THE_ALPHABET = ['foo_bar', 'café'];

function withSlug<T extends { _id: string }>(document: T, slug: string): T {
	return { ...document, _id: `${document._id}-${slug}`, slug: { _type: 'slug', current: slug } };
}

// El cliente responde lo mismo que respondería Sanity: el resultado de evaluar la query real sobre los
// documentos, así el spec no inventa la forma cruda.
async function answerWith(dataset: unknown[]): Promise<void> {
	const result = await (await evaluate(parse(sitemapSlugsQuery), { dataset })).get();
	(client.fetch as Mock).mockResolvedValue(result);
}

describe('fetchSitemapSlugs', () => {
	const documents = [canonLiteraryWork, canonAuthor, canonCollection];

	it('keeps the slugs the domain can build', async () => {
		await answerWith(documents);

		const { literaryWorks, authors, collections } = await fetchSitemapSlugs();

		expect(literaryWorks.map(({ slug }) => slug)).toEqual([canonLiteraryWork.slug.current]);
		expect(authors.map(({ slug }) => slug)).toEqual([canonAuthor.slug.current]);
		expect(collections.map(({ slug }) => slug)).toEqual([canonCollection.slug.current]);
	});

	it('drops the slugs that pass the query but not the domain rule', async () => {
		await answerWith([
			...documents,
			...OUTSIDE_THE_ALPHABET.flatMap((slug) => [
				withSlug(canonLiteraryWork, slug),
				withSlug(canonAuthor, slug),
				withSlug(canonCollection, slug),
			]),
		]);

		const result = await fetchSitemapSlugs();
		const published = [...result.literaryWorks, ...result.authors, ...result.collections].map(({ slug }) => slug);

		expect(published).toHaveLength(documents.length);
		published.forEach((slug) => expect(isSlug(slug)).toBe(true));
	});
});
