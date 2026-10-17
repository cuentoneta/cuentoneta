import { isValid, parseISO } from 'date-fns';
import { isSlug } from '@models/slug.model';
import { HISTORICAL_YEAR_RANGE, parseHistoricalDate } from '@utils/historical-date.utils';

export const localizedRequire = (value: unknown): true | string => {
	if (!value) return 'Este campo es requerido';
	return true;
};

export function validateHistoricalDate(value?: string): true | string {
	if (!value) return true;
	const parts = parseHistoricalDate(value);
	if (!parts) return 'Formato inválido. Usar YYYY-MM-DD o -YYYY-MM-DD para fechas a.C.';
	const { year, yearDigits, month, day, isBce } = parts;
	if (year === 0) return 'No existe el año 0 en numeración histórica (1 a.C. precede a 1 d.C.).';
	if (year < HISTORICAL_YEAR_RANGE.min || year > HISTORICAL_YEAR_RANGE.max) {
		return `Año fuera de rango admitido (${HISTORICAL_YEAR_RANGE.min} a ${HISTORICAL_YEAR_RANGE.max}).`;
	}
	const iso = isBce ? `-${yearDigits.padStart(6, '0')}-${month}-${day}` : `${yearDigits}-${month}-${day}`;
	if (!isValid(parseISO(iso))) return 'Fecha calendario inválida (revisar día y mes para el año indicado).';
	return true;
}

/**
 * Exige una ruta del sitio escrita desde la raíz (`/collection/x`). El enlace la resuelve contra la
 * página que lo muestra, así que una ruta relativa cambia de destino —o rompe el render— según la URL de
 * esa página; una con esquema o con `//` sale del sitio, y el enlace solo navega dentro de él. Un campo
 * vacío pasa, porque la ausencia la decide `localizedRequire`, con el que esta regla se compone.
 */
export function validateRootRelativePath(value?: string): true | string {
	if (!value) return true;
	if (value.startsWith('/') && !value.startsWith('//')) return true;
	return 'Usar una ruta del sitio que empiece con "/" (p. ej. "/collection/verano-2022").';
}

/**
 * Exige que el slug tenga el formato que el dominio sabe construir: un slug que lo viola queda
 * publicado en una URL que la plataforma no puede servir. Un campo vacío pasa, porque la ausencia la
 * decide `Rule.required()`, con el que esta regla se compone.
 */
export function validateSlugFormat(value?: { current?: string }): true | string {
	if (!value?.current) return true;
	if (isSlug(value.current)) return true;
	return 'Formato inválido. Usar solo minúsculas sin tildes, números y guiones simples entre palabras (p. ej. "que-seria-yo-sin-ti").';
}
