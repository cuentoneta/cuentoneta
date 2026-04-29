import { isValid, parseISO } from 'date-fns';

export const localizedRequire = (value) => {
	if (!value) return 'Este campo es requerido';
	return true;
};

export function validateHistoricalDate(value?: string): true | string {
	if (!value) return true;
	const match = /^(-?)(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return 'Formato inválido. Usar YYYY-MM-DD o -YYYY-MM-DD para fechas a.C.';
	const [, sign, y, m, d] = match;
	const year = parseInt(sign + y, 10);
	if (year === 0) return 'No existe el año 0 en numeración histórica (1 a.C. precede a 1 d.C.).';
	if (year < -3000 || year > 2100) return 'Año fuera de rango admitido (-3000 a 2100).';
	const iso = sign === '-' ? `-${y.padStart(6, '0')}-${m}-${d}` : `${y}-${m}-${d}`;
	if (!isValid(parseISO(iso))) return 'Fecha calendario inválida (revisar día y mes para el año indicado).';
	return true;
}
