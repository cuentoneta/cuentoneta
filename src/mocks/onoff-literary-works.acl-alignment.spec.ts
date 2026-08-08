import type { LiteraryWork } from '@models/literary-work.model';
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';

// El builder de imágenes resuelve la referencia al asset local que la tabla del corpus le asocia, en vez
// de a una URL de `cdn.sanity.io` que dependería del dataset del entorno. Así las dos capas dicen lo
// mismo sobre cada imagen y la comparación no necesita dejar ningún campo afuera.
/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

function comparable(work: LiteraryWork): unknown {
	return {
		...work,
		// `SectionTitle` lleva `toAnchor`, y las funciones se comparan por referencia: dos instancias con el
		// mismo texto nunca son iguales. Se compara su valor, que es lo que el título afirma.
		content: work.content.map((section) => ({ ...section, title: section.title?.value })),
	};
}

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

// El corpus de dominio es el fixture con el que specs y stories hacen de cuenta que son la respuesta de la
// API. Si deja de coincidir con lo que el ACL produce a partir del raw, todo lo que lo consume pasa en
// verde afirmando una forma que la API no devuelve.
//
// El autor embebido queda cubierto acá y en el cruce de `Collection`. El de la página de perfil no: su
// módulo resuelve el cliente de Sanity a nivel de módulo, sin punto de inyección, y el corpus no declara
// una fixture cruda tipada contra el resultado de su query.
describe('el corpus de dominio de LiteraryWork coincide con el mapeo del ACL', () => {
	it.each(onoffRawLiteraryWorksMock.map((raw) => raw.slug))(
		'maps the raw of "%s" into its domain mock',
		async (slug) => {
			const raw = onoffRawLiteraryWorksMock.find((candidate) => candidate.slug === slug);
			const expected = onoffLiteraryWorksMock.find((work) => work.slug === slug);
			const mapped = await repoReturning(raw).fetchBySlug(slug);

			expect(mapped).toBeDefined();
			expect(expected).toBeDefined();
			// `toEqual` y no `toStrictEqual`: una clave ausente y una en `undefined` significan lo mismo acá —un
			// campo opcional que la obra no trae— y cuál de las dos formas queda depende de si el lado la pasó
			// explícitamente a la factory. Es diferencia de invocación, no de valor.
			expect(comparable(mapped as LiteraryWork)).toEqual(comparable(expected as LiteraryWork));
		},
	);
});
