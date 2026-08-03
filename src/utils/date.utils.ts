export type DateString = `${string | number}-${string | number}-${string | number}`;

// Fecha-hora ISO 8601 (p. ej. `2022-01-25T23:26:34Z`), como las exponen los campos de sistema de Sanity.
export type IsoDateTime = `${DateString}T${string}`;

export function createIsoDateTime(value: string): IsoDateTime {
	if (!/^\d{4}-\d{2}-\d{2}T.+$/.test(value)) {
		throw new Error(`IsoDateTime inválida: "${value}"`);
	}
	return value as IsoDateTime;
}
