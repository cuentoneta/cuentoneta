import { getISOWeek, getISOWeekYear } from 'date-fns';

// Espejo de buildWeekSlug (src/api/modules/content/content.service.ts): formato YYYY-WW con numeración
// ISO-8601 (lunes = día 1; la semana 1 es la que contiene el primer jueves del año). La convención ISO
// está fijada en #1751; si cambia allá, actualizar acá para que el Studio no diverja de lo que sirve prod.
export function activeWeekSlug(date: Date = new Date()): string {
	return `${getISOWeekYear(date)}-${getISOWeek(date).toString().padStart(2, '0')}`;
}

// Espejo de latestLandingPageReferencesQuery (src/api/_queries/content.query.ts): la landing activa es la
// más reciente cuyo config es <= la semana ISO actual. El order desc + [0] garantiza una única activa; las
// semanas futuras ya cargadas (config > slug) quedan fuera hasta que su semana llegue.
export const ACTIVE_LANDING_ID_QUERY = `*[_type == "landingPage" && !(_id in path("drafts.**")) && config <= $slug] | order(config desc)[0]._id`;

export const LANDING_LIST_QUERY = `*[_type == "landingPage" && !(_id in path("drafts.**"))] | order(config desc){ _id, config }`;

// Estructural para no acoplar a los tipos de @sanity/client; useClient() satisface esta forma.
type GroqClient = {
	fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
};

export async function resolveActiveLandingId(client: GroqClient, date: Date = new Date()): Promise<string | null> {
	const id = await client.fetch<string | null>(ACTIVE_LANDING_ID_QUERY, { slug: activeWeekSlug(date) });
	return id ?? null;
}
