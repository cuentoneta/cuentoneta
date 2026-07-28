export type SanitizedHtml = string & { readonly __brand: 'SanitizedHtml' };

// No sanitiza: brandea un string que el llamador garantiza ya pasado por el pipeline
// compartido de sanitización (contrato y corte de implementación en docs/LITERARY_WORK_DESIGN.md §9).
export function createSanitizedHtml(value: string): SanitizedHtml {
	if (value.trim() === '') {
		throw new Error('SanitizedHtml inválido: contenido vacío');
	}
	return value as SanitizedHtml;
}
