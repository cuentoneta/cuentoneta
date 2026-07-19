// Helpers de parseo estático (texto → texto) para el guardrail de SEO de páginas. Operan sobre el
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

/**
 * Lista los incumplimientos de la convención de SEO de una página según su indexabilidad (vacío = conforme).
 * Es la lógica de detección del guardrail, separada del spec para poder cubrir el camino de fallo con fixtures.
 * - Indexable: exige una `<Page>MetaTagsDirective` y una `<Page>StructuredDataDirective` en `hostDirectives`.
 * - No indexable: exige `hostDirectives` exactamente `[HeadMetadataDirective]` y un `setRobots('noindex...')`.
 */
export function collectSeoViolations(indexable: boolean, source: string): string[] {
	const hostDirectives = extractHostDirectiveNames(source);
	const declared = `hostDirectives: [${hostDirectives.join(', ')}]`;
	const violations: string[] = [];
	if (indexable) {
		if (!hostDirectives.some((name) => /MetaTagsDirective$/.test(name))) {
			violations.push(`falta una <Page>MetaTagsDirective (${declared})`);
		}
		if (!hostDirectives.some((name) => /StructuredDataDirective$/.test(name))) {
			violations.push(`falta una <Page>StructuredDataDirective (${declared})`);
		}
		return violations;
	}
	if (hostDirectives.length !== 1 || hostDirectives[0] !== 'HeadMetadataDirective') {
		violations.push(`se espera hostDirectives: [HeadMetadataDirective], hay [${hostDirectives.join(', ')}]`);
	}
	if (!extractRobotsLiteral(source)?.includes('noindex')) {
		violations.push(`falta setRobots('noindex...') — el opt-out de indexación no está wireado en el código`);
	}
	return violations;
}
