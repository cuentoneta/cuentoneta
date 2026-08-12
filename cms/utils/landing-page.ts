import { buildWeekSlug } from '@utils/week-slug.utils';

export const API_VERSION = '2024-01-01';

export interface LandingPageRow {
	_id: string;
	config: string;
}

// Espejo de latestLandingPageReferencesQuery (src/api/_queries/content.query.ts): la landing activa es la
// más reciente cuyo config es <= la semana ISO actual, desempatando por _createdAt desc igual que producción
// — así, ante configs duplicados (el schema no fuerza unicidad), el Studio resuelve el mismo documento que
// sirve la home, no otro.
export const ACTIVE_LANDING_ID_QUERY = `*[_type == "landingPage" && !(_id in path("drafts.**")) && config <= $slug] | order(config desc, _createdAt desc)[0]._id`;

export const LANDING_LIST_QUERY = `*[_type == "landingPage" && !(_id in path("drafts.**"))] | order(config desc, _createdAt desc){ _id, config }`;

// Estructural para no acoplar a los tipos de @sanity/client; useClient() satisface esta forma.
type GroqClient = {
	fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
};

export async function resolveActiveLandingId(client: GroqClient, date: Date = new Date()): Promise<string | null> {
	const id = await client.fetch<string | null>(ACTIVE_LANDING_ID_QUERY, { slug: buildWeekSlug(date) });
	return id ?? null;
}

/** Cómo se presenta una fila: el tono de su ficha y el rótulo de su clasificación, si lleva alguno. */
export interface LandingPageRowPresentation {
	readonly tone: 'positive' | 'primary' | 'default';
	readonly badge: string | null;
}

/**
 * La referencia contra la que se clasifican las filas: el `config` de la activa, que es el máximo
 * menor o igual a la semana actual. Sin activa se cae a la semana actual, para que toda fila
 * posterior siga leyéndose como futura en vez de confundirse con el pasado.
 */
export function activeConfigOf(
	rows: readonly LandingPageRow[],
	activeId: string | null,
	date: Date = new Date(),
): string {
	return rows.find((row) => row._id === activeId)?.config ?? buildWeekSlug(date);
}

/** Clasifica una fila contra la referencia: activa, semana futura, o cualquier otra. */
export function presentationOf(
	row: LandingPageRow,
	activeId: string | null,
	activeConfig: string,
): LandingPageRowPresentation {
	if (row._id === activeId) {
		return { tone: 'positive', badge: 'Activa' };
	}
	if (row.config > activeConfig) {
		return { tone: 'primary', badge: 'Futura' };
	}
	return { tone: 'default', badge: null };
}
