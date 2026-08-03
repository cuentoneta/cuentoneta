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
