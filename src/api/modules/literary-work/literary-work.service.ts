import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
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

// Sin autor o sin obras responde una lista vacía: el módulo no conoce la entidad Author —solo sus
// referencias—, así que distinguir "autor inexistente" de "autor sin obras" no es su decisión.
export async function getLiteraryWorksByAuthorSlug(
	slug: string,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<LiteraryWorkTeaser[]> {
	return repository.fetchByAuthorSlug(slug);
}
