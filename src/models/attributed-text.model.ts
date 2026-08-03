import type { SanitizedHtml } from './sanitized-html.model';

// Un bloque de texto con su atribución opcional. Nombra la forma y no el rol: la usan tanto el
// epígrafe de una sección —que cita a un tercero— como la nota editorial de la obra —que comenta
// desde la redacción y no cita a nadie—.
export interface AttributedText {
	readonly text: SanitizedHtml;
	readonly reference?: SanitizedHtml;
}

interface CreateAttributedTextOptions {
	text: SanitizedHtml;
	reference?: SanitizedHtml;
}

// Composición pura: text y reference ya vienen validados por SanitizedHtml.
export function createAttributedText(options: CreateAttributedTextOptions): AttributedText {
	return Object.freeze({ ...options });
}
