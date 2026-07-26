import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkNotFoundError, LiteraryWorkSectionNotFoundError } from './literary-work.errors';
import { SanityLiteraryWorkRepository, type LiteraryWorkRepository } from './literary-work.repository';

// `repository` con default permite inyectar el doble in-memory en tests sin module mocking;
// los callers reales usan la firma de dos parámetros del contrato (LITERARY_WORK_DESIGN.md §6).
// El repository ya devuelve dominio (mapea en la frontera del ACL): acá solo orquestamos.
export async function getLiteraryWorkBySlug(
	slug: string,
	section?: number,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<LiteraryWork> {
	const literaryWork = await repository.fetchBySlug(slug);
	if (!literaryWork) {
		throw new LiteraryWorkNotFoundError(slug);
	}
	if (section === undefined) {
		return literaryWork;
	}
	return projectSection(literaryWork, section);
}

// Proyección de solo-lectura: NO reconstruye vía createLiteraryWork (su invariante de contigüidad
// asume el agregado completo — LITERARY_WORK_DESIGN.md §2/§7); recortar `content` de un agregado
// ya validado no reabre sus invariantes.
function projectSection(work: LiteraryWork, section: number): LiteraryWork {
	const found = work.content.find((candidate) => candidate.position === section);
	if (!found) {
		throw new LiteraryWorkSectionNotFoundError(work.slug, section);
	}
	return Object.freeze({ ...work, content: [found] });
}
