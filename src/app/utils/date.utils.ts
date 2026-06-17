export type DateString = `${string | number}-${string | number}-${string | number}`;

// Fecha-hora ISO 8601 (p. ej. `2022-01-25T23:26:34Z`), como las exponen los campos de sistema de Sanity.
export type IsoDateTime = `${DateString}T${string}`;
