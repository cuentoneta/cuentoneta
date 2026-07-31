export type SanitizedHtml = string & { readonly __brand: 'SanitizedHtml' };

// Construcciones que la allow-list del pipeline nunca emite. No son una sanitización —el brand no
// sanea, delega— sino una alarma en el único punto por el que se entra al tipo: si el backend
// regresara y sirviera HTML sin procesar, esto lo detiene en la frontera en vez de dejarlo llegar a
// un [innerHTML] con bypass. Reconocen forma de tag o de atributo, no texto: una obra puede
// mencionar "javascript:" o "<script>" en su prosa, y ahí llegan escapados.
const UNSAFE_HTML_PATTERNS = Object.freeze([
	/<\s*(script|iframe|object|embed|form|base)\b/i,
	/<[^>]+\son[a-z]+\s*=/i,
	/\s(?:href|src|xlink:href)\s*=\s*["'\s]*javascript:/i,
]);

// No sanitiza: brandea un string que el llamador garantiza ya pasado por el pipeline
// compartido de sanitización (contrato y corte de implementación en docs/LITERARY_WORK_DESIGN.md §9).
export function createSanitizedHtml(value: string): SanitizedHtml {
	if (value.trim() === '') {
		throw new Error('SanitizedHtml inválido: contenido vacío');
	}
	if (UNSAFE_HTML_PATTERNS.some((pattern) => pattern.test(value))) {
		throw new Error('SanitizedHtml inválido: el contenido no pasó por el pipeline de sanitización');
	}
	return value as SanitizedHtml;
}
