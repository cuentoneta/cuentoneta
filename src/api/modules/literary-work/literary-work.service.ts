import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';

// El default permite inyectar el doble en tests sin module mocking. El repository es stateless, así que
// instanciarlo por llamada no tiene costo de estado compartido.
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
