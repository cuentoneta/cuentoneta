/**
 * El cruce del corpus de dominio de `Collection` contra su ACL. El porqué general —qué protege que las dos
 * capas coincidan— está en el spec homónimo de `LiteraryWork`; acá interesa por qué no alcanza con aquel.
 *
 * Una colección no embebe obras: embebe **teasers**, que salen de una proyección más angosta y de un mapper
 * distinto. Una obra puede mapear bien entera y estar mal como teaser —le sobra una clave que la proyección
 * no trae, o le falta una que sí—, y el cruce de `LiteraryWork` no lo vería.
 *
 * Y `imagery` solo existe acá: es el único campo del corpus que el ACL **deriva** en vez de transportar.
 * Cuando la colección no trae portada editorial, el mapper la arma con las portadas de sus obras, así que
 * es la única pieza cuyo valor esperado depende de otras entidades del corpus. Las dos colecciones del
 * elenco están curadas para cubrir una rama cada una.
 *
 * **Qué no cubre:** el repository resuelve una colección por dos caminos —`fetchBySlug` para la vista de
 * detalle y `fetchAll` para el listado— y este cruce ejercita el primero. El listado comparte `mapShared`
 * pero arma su `imagery` desde otra proyección, así que una regresión que viva solo ahí pasa en verde.
 */
import type { Collection } from '@models/collection.model';
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityCollectionRepository } from '../api/modules/collection/collection.repository.sanity';
import { onoffCollectionsMock } from './onoff-collections.mock';
import { onoffRawCollectionsMock } from './onoff-raw-collections.mock';

// Ver el spec homónimo de `LiteraryWork` para el porqué de sustituir el builder de imágenes.
/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { localImagePathForImageSource } = await import('./onoff-image-assets.mock');
	return {
		createImageUrlBuilder: () => ({
			image: (source: unknown) => {
				const built = { url: () => localImagePathForImageSource(source), auto: () => built };
				return built;
			},
		}),
	};
});
/* eslint-enable no-restricted-syntax */

function comparable(collection: Collection): unknown {
	return {
		...collection,
		literaryWorks: collection.literaryWorks.map((work) => ({
			...work,
			// `epigraphs` queda fuera porque la proyección de teaser no los trae: el ACL ni siquiera declara la
			// clave y el corpus la declara vacía, que significan lo mismo pero no comparan igual.
			teaserSection: {
				...work.teaserSection,
				title: work.teaserSection.title?.value,
				epigraphs: undefined,
			},
		})),
	};
}

function repoReturning(raw: unknown): SanityCollectionRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityCollectionRepository(client);
}

describe('el corpus de dominio de Collection coincide con el mapeo del ACL', () => {
	it.each(onoffRawCollectionsMock.map((raw) => raw.slug))('maps the raw of "%s" into its domain mock', async (slug) => {
		const raw = onoffRawCollectionsMock.find((candidate) => candidate.slug === slug);
		const expected = onoffCollectionsMock.find((collection) => collection.slug === slug);
		const mapped = await repoReturning(raw).fetchBySlug(slug);

		expect(mapped).toBeDefined();
		expect(expected).toBeDefined();
		expect(comparable(mapped as Collection)).toEqual(comparable(expected as Collection));
	});
});
