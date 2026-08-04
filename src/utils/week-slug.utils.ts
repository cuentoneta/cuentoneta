import { getISOWeek, getISOWeekYear } from 'date-fns';

// Formato YYYY-WW con numeración ISO-8601 (lunes = día 1; la semana 1 es la que contiene el primer
// jueves del año). El orden lexicográfico sigue coincidiendo con el cronológico: getISOWeekYear
// etiqueta la semana con su año ISO, no con el calendario, así que el cruce dic/ene no rompe el orden.
export function buildWeekSlug(date: Date): string {
	return `${getISOWeekYear(date)}-${getISOWeek(date).toString().padStart(2, '0')}`;
}
