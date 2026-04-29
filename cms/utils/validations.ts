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
	const iso = sign === '-' ? `-${y.padStart(6, '0')}-${m}-${d}` : `${y}-${m}-${d}`;
	if (!isValid(parseISO(iso))) return 'Fecha calendario inválida.';
	return true;
}
