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

// Acá vive la decisión de tolerar, que es una política de listado y no de traducción: una obra que el
// CMS dejó inconsistente no debe llevarse puestas a las demás en un listado. La política es por obra
// y no cambia con la cantidad — todas mal curadas es un listado vacío, que el consumidor ya sabe no
// dibujar; lo que distingue ese caso de "el filtro no tiene resultados" no es el status sino el
// registro del descarte.
export async function getLiteraryWorkTeasers(
	filter: LiteraryWorkTeaserFilter,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<readonly LiteraryWorkTeaser[]> {
	const { literaryWorks, malformed } = await repository.fetchTeasers(filter);
	for (const error of malformed) {
		console.warn(`[LiteraryWork] Obra descartada del listado de teasers: "${error.slug}"`, error.cause);
	}
	return literaryWorks;
}
