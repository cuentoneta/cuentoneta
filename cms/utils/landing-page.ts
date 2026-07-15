import { getISOWeek, getISOWeekYear } from 'date-fns';

export const API_VERSION = '2024-01-01';

export interface LandingPageRow {
	_id: string;
	config: string;
}

// Espejo de buildWeekSlug (src/api/modules/content/content.service.ts): formato YYYY-WW con numeración
// ISO-8601 (lunes = día 1; la semana 1 es la que contiene el primer jueves del año).
export function activeWeekSlug(date: Date = new Date()): string {
	return `${getISOWeekYear(date)}-${getISOWeek(date).toString().padStart(2, '0')}`;
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
	const id = await client.fetch<string | null>(ACTIVE_LANDING_ID_QUERY, { slug: activeWeekSlug(date) });
	return id ?? null;
}
