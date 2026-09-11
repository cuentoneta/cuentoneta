/**
 * Enumera los incumplimientos de la convención de layout en el fuente de una página —su `.ts` o su `.html`—,
 * como los mensajes que ve quien la rompe. Devuelve `[]` cuando la página cumple.
 */
export function collectPageLayoutViolations(source: string): string[] {
	// El borde descarta un identificador que empiece con "main", como `mainEntity`.
	const mainElement = /<main[\s>]/;
	// Admite `:` por los variantes de breakpoint y excluye `-`, que es el opt-out. `top-` y `h-` quedan
	// fuera: son la columna sticky y el alto de la barra, no el despeje.
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
