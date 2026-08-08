import type { LiteraryWork } from '@models/literary-work.model';
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';

// Los campos que el ACL resuelve con `urlFor` son los únicos donde las dos capas no pueden coincidir: el
// mapeo produce una URL de `cdn.sanity.io` del dataset del entorno y el corpus de dominio declara la ruta
// del asset local. Quedan fuera del cruce hasta que el puente de referencias a assets locales los
// reconcilie; todo lo demás se compara entero.
function comparable(work: LiteraryWork): unknown {
	return {
		...work,
		coverImage: undefined,
		authors: work.authors.map((author) => ({
			...author,
			imageUrl: undefined,
			nationality: { ...author.nationality, flag: undefined },
		})),
		// `SectionTitle` lleva `toAnchor`, y las funciones se comparan por referencia: dos instancias con el
		// mismo texto nunca son iguales. Se compara su valor, que es lo que el título afirma.
		content: work.content.map((section) => ({ ...section, title: section.title?.value })),
		mediaSources: work.mediaSources.map((media) => {
			const data = media.data as Record<string, unknown>;
			return 'hostAvatar' in data ? { ...media, data: { ...data, hostAvatar: undefined } } : media;
		}),
	};
}

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

// El corpus de dominio es el fixture con el que specs y stories hacen de cuenta que son la respuesta de la
// API. Si deja de coincidir con lo que el ACL produce a partir del raw, todo lo que lo consume pasa en
// verde afirmando una forma que la API no devuelve.
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
