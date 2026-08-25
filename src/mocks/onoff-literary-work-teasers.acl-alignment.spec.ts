/**
 * El cruce del corpus de dominio de los teasers de obra contra su ACL. El porqué general está en el
 * spec homónimo de `LiteraryWork`; acá interesa por qué no alcanza ni con aquel ni con el de
 * `Collection`.
 *
 * El mapper de teaser existe **dos veces** por diseño —cada repository es dueño de su ACL— y el cruce
 * de colección ejercita solo su copia. La de `literary-work`, que sirve al listado por autor, quedaría
 * sin nadie que la cruce contra el corpus: la duplicación sancionada es exactamente lo que puede
 * divergir en silencio, y este spec es lo que lo impide.
 */
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorkTeasersMock } from './onoff-literary-work-teasers.mock';
import { onoffRawLiteraryWorkTeasersMock } from './onoff-raw-literary-works.mock';

// Ver el spec homónimo de `LiteraryWork` para el porqué de sustituir el builder de imágenes.
/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

function comparable(teaser: LiteraryWorkTeaser): unknown {
	return {
		...teaser,
		// El título se aplana a su valor: es un value object con método, y comparar objetos con
		// comportamiento contra el literal de la fixture no diría nada útil.
		excerpt: {
			...teaser.excerpt,
			title: teaser.excerpt.title?.value,
		},
	};
}

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

describe('el corpus de dominio de los teasers de obra coincide con el mapeo del ACL', () => {
	// El raw derivado de las colecciones cubre las obras curadas, no el canon entero: el cruce se
	// aparea por slug y una obra sin contraparte cruda simplemente no participa.
	it.each(onoffRawLiteraryWorkTeasersMock.map((raw) => raw.slug))(
		'maps the raw teaser of "%s" into its domain mock',
		async (slug) => {
			const raw = onoffRawLiteraryWorkTeasersMock.find((candidate) => candidate.slug === slug);
			const expected = onoffLiteraryWorkTeasersMock.find((teaser) => teaser.slug === slug);
			const { literaryWorks } = await repoReturning([raw]).fetchByAuthorSlug('x');
			const [mapped] = literaryWorks;

			expect(mapped).toBeDefined();
			expect(expected).toBeDefined();
			expect(comparable(mapped)).toEqual(comparable(expected as LiteraryWorkTeaser));
		},
	);
});
