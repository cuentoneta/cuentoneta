import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkSectionNotFoundError } from './literary-work.errors';

// Puerto del repository de LiteraryWork. Vive separado de sus adaptadores (Sanity, in-memory) para que
// ninguno dependa del otro: ambos implementan esta interfaz e importan de acá, nunca entre sí (DIP —
// la interfaz vive con quien la usa, no con quien la implementa).
export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchSectionBySlug(slug: string, section: number): Promise<LiteraryWork | null>;
}

// Proyecta el agregado completo a una sola sección por `position` (respuesta parcial ?section=N servida
// desde un full-fetch). Lanza si el índice no existe. Es **lógica del contrato** (dominio→dominio, sin
// infraestructura): parte de lo que significa implementar `fetchSectionBySlug`, no un detalle de Sanity —
// por eso la comparten el adaptador Sanity (cold-start) y el doble in-memory desde el puerto, sin que uno
// dependa del otro.
export function projectSingleSection(full: LiteraryWork, slug: string, section: number): LiteraryWork {
	const found = full.content.find((candidate) => candidate.position === section);
	if (!found) {
		throw new LiteraryWorkSectionNotFoundError(slug, section);
	}
	return Object.freeze({ ...full, content: [found] });
}
