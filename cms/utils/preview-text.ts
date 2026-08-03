// Shape mínimo de los bloques que recorren los previews del Studio. No reclama el concepto completo de
// Portable Text —para eso ya está PortableTextBlock en resources/portable-text-to-markdown—: acá solo
// interesa el texto de los spans, y todo es opcional porque el editor puede haber cargado el campo a
// medias mientras escribe.
export type PreviewTextBlock = { children?: { text?: string }[] };

// El vacío es un caso esperado, no una condición de borde: se resuelve una vez acá en vez de que cada
// preview chequee la ausencia antes de mapear.
export function toPlainText(blocks: PreviewTextBlock[] | undefined): string {
	return (blocks ?? [])
		.flatMap((block) => block.children ?? [])
		.map((child) => child.text ?? '')
		.join('');
}
