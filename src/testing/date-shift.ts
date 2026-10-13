import type { DateString } from '@utils/date.utils';

/**
 * Desplaza una fecha `YYYY-MM-DD` la cantidad de días indicada (negativa hacia atrás). Opera en UTC para
 * que el resultado no dependa de la zona horaria de la máquina que corre el spec.
 */
export function shiftDays(date: DateString, days: number): DateString {
	const shifted = new Date(`${date}T00:00:00Z`);
	shifted.setUTCDate(shifted.getUTCDate() + days);
	return shifted.toISOString().slice(0, 10) as DateString;
}
