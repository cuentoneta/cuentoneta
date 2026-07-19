// Helpers de parseo estático (texto → texto) para el guardrail de SEO de páginas (#1726). Operan sobre el
// código fuente de un componente de página como string; no dependen de Angular, Ivy ni el DOM, y por eso son
// unit-testeables con fixtures inline en `seo-host-directives.util.spec.ts`.

/**
 * Extrae los nombres de las directivas declaradas en `hostDirectives: [...]` del decorador `@Component`.
 * Devuelve `[]` si no hay `hostDirectives` o el array está vacío. La clase negada `[^\]]` cubre arrays
 * multilínea sin necesitar la flag `s`; asume la forma simple (array de identificadores) que usan las páginas.
 */
export function extractHostDirectiveNames(source: string): string[] {
	const match = source.match(/hostDirectives:\s*\[([^\]]*)\]/);
	if (!match) {
		return [];
	}
	return match[1]
		.split(',')
		.map((name) => name.trim())
		.filter((name) => name.length > 0);
}

/**
 * Devuelve el literal pasado a la primera llamada `setRobots('...')` del componente, o `undefined` si no hay
 * ninguna. Acepta comillas simples o dobles.
 */
export function extractRobotsLiteral(source: string): string | undefined {
	const match = source.match(/setRobots\(\s*['"]([^'"]*)['"]/);
	return match ? match[1] : undefined;
}
