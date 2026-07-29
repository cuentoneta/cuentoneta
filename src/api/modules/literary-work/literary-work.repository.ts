import type { LiteraryWork } from '@models/literary-work.model';

// Puerto del repository de LiteraryWork. Vive separado de sus adaptadores (Sanity, in-memory) para que
// el doble dependa del contrato, no del adaptador concreto (DIP — la interfaz vive con quien la usa, no
// con quien la implementa). Hoy expone una sola lectura: la obra completa por slug. La lectura de una
// sección puntual (?section=N) se difiere hasta que exista un caso de uso — en la migración Story →
// LiteraryWork todo el texto ocupa `content[0]`.
export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
}
