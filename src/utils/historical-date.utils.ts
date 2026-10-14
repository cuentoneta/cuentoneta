/**
 * Rango de años admitido para las fechas históricas de un autor. Numeración histórica: el año -43 es
 * 43 a.C. y no existe el año 0.
 */
export const HISTORICAL_YEAR_RANGE = Object.freeze({ min: -3000, max: 2100 } as const);

export interface HistoricalDateParts {
	/** Año con numeración histórica (negativo para a.C.). Puede ser 0 o estar fuera de rango: no se valida acá. */
	year: number;
	/** Dígitos del año tal como vienen en el texto, sin signo. */
	yearDigits: string;
	month: string;
	day: string;
	isBce: boolean;
}

/**
 * Descompone `YYYY-MM-DD` o `-YYYY-MM-DD` (a.C.) sin validar rango ni calendario. Devuelve `undefined`
 * si el texto no tiene ese formato.
 */
export function parseHistoricalDate(value: string): HistoricalDateParts | undefined {
	const match = /^(-?)(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return undefined;
	const [, sign, yearDigits, month, day] = match;
	return { year: parseInt(sign + yearDigits, 10), yearDigits, month, day, isBce: sign === '-' };
}

/**
 * Año de una fecha histórica, o `undefined` si no hay fecha, el formato es inválido, el año es 0 o queda
 * fuera de `HISTORICAL_YEAR_RANGE`. Es la regla con la que el API deriva el año de nacimiento y de
 * fallecimiento de un autor, y coincide con lo que el Studio acepta al cargar la fecha.
 */
export function yearOfHistoricalDate(date?: string | null): number | undefined {
	if (!date) return undefined;
	const parts = parseHistoricalDate(date);
	if (!parts || parts.year === 0) return undefined;
	if (parts.year < HISTORICAL_YEAR_RANGE.min || parts.year > HISTORICAL_YEAR_RANGE.max) return undefined;
	return parts.year;
}
