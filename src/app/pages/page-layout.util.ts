// Helpers de parseo estático (texto → texto) para el guardrail de layout de páginas. Operan sobre el fuente
// de una página como string —su `.ts` o su `.html`—, así que son unit-testeables con fixtures inline.

/**
 * Enumera los incumplimientos de la convención de layout en el fuente de una página. Devuelve `[]` cuando la
 * página cumple. Cada string es el mensaje que se le muestra a quien rompe la convención.
 */
export function collectPageLayoutViolations(source: string): string[] {
	// Un `<main>` seguido de espacio, salto o cierre: no matchea un identificador que empiece con "main",
	// como el `mainEntity` de los datos estructurados.
	const mainElement = /<main[\s>]/;
	// El despeje del encabezado, sin capturar el opt-out. El borde admite `:` para los variantes de
	// breakpoint y excluye `-`, que es lo que distingue `-mt-header-height`. `top-header-height` y
	// `h-header-height` quedan fuera a propósito: son la columna sticky y el alto de la barra.
	const headerClearance = /(^|[\s"'`:])(mt|pt)-header-height/m;
	const retiredSpacingClass = /vertical-layout-spacing/;

	const violations: string[] = [];

	if (mainElement.test(source)) {
		violations.push('declara un <main> propio; el landmark principal lo declara el shell (AppComponent)');
	}
	if (headerClearance.test(source)) {
		violations.push('despeja el encabezado por su cuenta; el shell ya reserva su alto');
	}
	if (retiredSpacingClass.test(source)) {
		violations.push('usa vertical-layout-spacing, que ya no existe; el aire propio va como utilidad local');
	}

	return violations;
}
