import { evaluate, parse } from 'groq-js';
import { clearAllMocks, type Mock } from '@test-utils';
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

interface SitemapSlugsQueryResult {
	literaryWorks: { slug: string | null }[];
	authors: { slug: string | null }[];
	collections: { slug: string | null }[];
}

const [canonLiteraryWork] = onoffLiteraryWorkDocumentsMock;
const [canonAuthor] = onoffAuthorDocumentsMock;
const [canonCollection] = onoffCollectionDocumentsMock;

function withSlug<T extends { _id: string }>(document: T, slug: string): T {
	return { ...document, _id: `${document._id}-${slug}`, slug: { _type: 'slug', current: slug } };
}

// El cliente responde lo mismo que respondería Sanity: el resultado de evaluar la query real sobre los
// documentos, así el spec no inventa la forma cruda.
async function answerWith(dataset: unknown[]): Promise<SitemapSlugsQueryResult> {
	const result = (await (await evaluate(parse(sitemapSlugsQuery), { dataset })).get()) as SitemapSlugsQueryResult;
	(client.fetch as Mock).mockResolvedValue(result);
	return result;
}

const slugsOf = (result: SitemapSlugsQueryResult) =>
	[...result.literaryWorks, ...result.authors, ...result.collections].map(({ slug }) => slug);

describe('fetchSitemapSlugs', () => {
	const documents = [canonLiteraryWork, canonAuthor, canonCollection];

	beforeEach(() => {
		clearAllMocks();
	});

	it('keeps the slugs the domain can build', async () => {
		await answerWith(documents);

		const { literaryWorks, authors, collections } = await fetchSitemapSlugs();

		expect(literaryWorks.map(({ slug }) => slug)).toEqual([canonLiteraryWork.slug.current]);
		expect(authors.map(({ slug }) => slug)).toEqual([canonAuthor.slug.current]);
		expect(collections.map(({ slug }) => slug)).toEqual([canonCollection.slug.current]);
	});

	it('drops the slugs that pass the query but not the domain rule', async () => {
		const outsideTheAlphabet = ['foo_bar', 'café'];
		const queryResult = await answerWith([
			...documents,
			...outsideTheAlphabet.flatMap((slug) => [
				withSlug(canonLiteraryWork, slug),
				withSlug(canonAuthor, slug),
				withSlug(canonCollection, slug),
			]),
		]);
		// Sin esta precondición el caso pasaría aunque la query ya los podara, sin ejercitar el repository.
		expect(slugsOf(queryResult)).toEqual(expect.arrayContaining(outsideTheAlphabet));

		const published = slugsOf(await fetchSitemapSlugs());

		expect(published).toHaveLength(documents.length);
		published.forEach((slug) => expect(isSlug(slug)).toBe(true));
	});
});
