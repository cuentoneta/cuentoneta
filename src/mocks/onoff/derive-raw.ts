/**
 * El estrechamiento de una fixture cruda en otra, cuando una query proyecta un subconjunto de lo que
 * otra ya devuelve. Lo usan las dos puntas: el generador, para saber qué campos no hace falta escribir,
 * y el archivo generado, para producirlos en tiempo de ejecución.
 *
 * **Qué no hace:** no calcula. El extracto de una obra, el conteo de obras de una colección y el abanico
 * de portadas los produce GROQ, no un recorte de campos, así que la fixture los sigue declarando. Si
 * alguno se derivara acá, el corpus pasaría a afirmar lo que creemos que la query devuelve en vez de lo
 * que devuelve, que es la inversión que esta capa existe para evitar.
 *
 * **Los campos se enumeran, no se quitan por resto.** Quitarlos deja al compilador sin nada que exigir:
 * un campo nuevo en la proyección ancha se colaría en la angosta y el tipo lo aceptaría. Enumerarlos hace
 * que la firma sea la que denuncia la divergencia.
 *
 * **Qué lo mantiene honesto:** el generador compara lo que estas funciones producen contra el resultado
 * real de la query. Si una proyección se aparta, los valores dejan de coincidir, la derivación no se
 * aplica y la fixture vuelve a escribirse entera. Que eso no pase inadvertido lo verifica
 * `../onoff-raw-corpus.spec.ts`.
 */
import type {
	CollectionBySlugQueryResult,
	CollectionsQueryResult,
	LandingPageContentQueryResult,
	LiteraryWorkBySlugQueryResult,
	LiteraryWorkTeasersResult,
} from '@sanity-types';

type RawLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type RawLiteraryWorkTeaser = LiteraryWorkTeasersResult[number];
type RawLandingLiteraryWork = NonNullable<LandingPageContentQueryResult>['latestLiteraryWorks'][number];
type RawCollection = NonNullable<CollectionBySlugQueryResult>;
type RawCollectionTeaser = CollectionsQueryResult[number];

// El autor embebido es el de la vista de detalle sin su biografía, sus recursos ni sus etiquetas.
function embeddedAuthorFrom(author: RawLiteraryWork['authors'][number]): RawLiteraryWorkTeaser['authors'][number] {
	return {
		_id: author._id,
		slug: author.slug,
		name: author.name,
		image: author.image,
		nationality: author.nationality,
		bornOn: author.bornOn,
		bornOnYear: author.bornOnYear,
		diedOn: author.diedOn,
		diedOnYear: author.diedOnYear,
	};
}

/** Los campos del teaser de una obra que ya trae su raw completo. El extracto no sale de acá. */
export function literaryWorkTeaserFrom(work: RawLiteraryWork): Omit<RawLiteraryWorkTeaser, 'excerpt'> {
	return {
		_id: work._id,
		slug: work.slug,
		title: work.title,
		coverImage: work.coverImage,
		totalReadingTime: work.totalReadingTime,
		sectionCount: work.sectionCount,
		tags: work.tags,
		// El listado solo necesita de qué tipo es cada medio y cómo se llama; la vista de detalle es la
		// que transporta la url, la descripción y el asset dereferenciado.
		mediaSources: work.mediaSources.map(({ _type, title }) => ({ _type, title })),
		authors: work.authors.map(embeddedAuthorFrom),
	};
}

/** La obra tal como la embebe la página de inicio: el teaser sin su extracto. */
export function landingLiteraryWorkFrom(teaser: RawLiteraryWorkTeaser): RawLandingLiteraryWork {
	return {
		_id: teaser._id,
		slug: teaser.slug,
		title: teaser.title,
		coverImage: teaser.coverImage,
		totalReadingTime: teaser.totalReadingTime,
		sectionCount: teaser.sectionCount,
		tags: teaser.tags,
		mediaSources: teaser.mediaSources,
		authors: teaser.authors,
	};
}

/** Los campos del teaser de una colección que ya trae su raw completo. El conteo y las portadas, no. */
export function collectionTeaserFrom(
	collection: RawCollection,
): Omit<RawCollectionTeaser, 'count' | 'literaryWorkCoverImages'> {
	return {
		_id: collection._id,
		slug: collection.slug,
		title: collection.title,
		description: collection.description,
		featuredImage: collection.featuredImage,
		config: collection.config,
		tags: collection.tags,
		mediaSources: collection.mediaSources,
	};
}
