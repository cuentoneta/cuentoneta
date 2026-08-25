import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository, LiteraryWorkTeaserFilter } from './literary-work.repository';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';

// El repository es stateless, así que instanciarlo por llamada (default) no comparte estado.
export async function getLiteraryWorkBySlug(
	slug: string,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<LiteraryWork> {
	const literaryWork = await repository.fetchBySlug(slug);
	if (!literaryWork) {
		throw new LiteraryWorkNotFoundError(slug);
	}
	return literaryWork;
}

// Sirve el catálogo de obras que satisfacen el filtro, como teasers.
export async function getLiteraryWorkTeasers(
	filter: LiteraryWorkTeaserFilter,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<readonly LiteraryWorkTeaser[]> {
	const { literaryWorks, malformed } = await repository.fetchTeasers(filter);
	// Descartar es una política de listado y no de traducción, por eso se decide acá: una obra que el
	// CMS dejó inconsistente no debe llevarse puestas a las demás. El registro en el servidor es lo
	// único que distingue este caso del filtro que legítimamente no tiene resultados.
	for (const error of malformed) {
		console.warn(`[LiteraryWork] Obra descartada del listado de teasers: "${error.slug}"`, error.cause);
	}
	return literaryWorks;
}
