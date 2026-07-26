import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import { SanityLiteraryWorkRepository, type LiteraryWorkRepository } from './literary-work.repository';

// `repository` con default permite inyectar el doble in-memory en tests sin module mocking;
// los callers reales usan la firma de dos parámetros del contrato (LITERARY_WORK_DESIGN.md §6).
// El repository ya devuelve dominio (mapea en la frontera del ACL) y resuelve la proyección parcial
// de `?section=N` sin transportar todos los bodies: acá solo orquestamos y traducimos el not-found.
export async function getLiteraryWorkBySlug(
	slug: string,
	section?: number,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<LiteraryWork> {
	const literaryWork =
		section === undefined ? await repository.fetchBySlug(slug) : await repository.fetchSectionBySlug(slug, section);
	if (!literaryWork) {
		throw new LiteraryWorkNotFoundError(slug);
	}
	return literaryWork;
}
