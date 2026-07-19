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
 * Lista los incumplimientos de la convención de SEO de una página (vacío = conforme). La indexabilidad se
 * deriva del propio código: una página que llama `setRobots('noindex...')` es un opt-out y solo debe declarar
 * `[HeadMetadataDirective]`; cualquier otra se considera indexable y debe declarar una `<Page>MetaTagsDirective`
 * y una `<Page>StructuredDataDirective`.
 */
export function collectSeoViolations(source: string): string[] {
	const hostDirectives = extractHostDirectiveNames(source);
	const declared = `hostDirectives: [${hostDirectives.join(', ')}]`;
	const violations: string[] = [];
	if (extractRobotsLiteral(source)?.includes('noindex')) {
		if (hostDirectives.length !== 1 || hostDirectives[0] !== 'HeadMetadataDirective') {
			violations.push(`página noindex: se espera hostDirectives: [HeadMetadataDirective], hay ${declared}`);
		}
		return violations;
	}
	if (!hostDirectives.some((name) => /MetaTagsDirective$/.test(name))) {
		violations.push(`página indexable: falta una <Page>MetaTagsDirective (${declared})`);
	}
	if (!hostDirectives.some((name) => /StructuredDataDirective$/.test(name))) {
		violations.push(`página indexable: falta una <Page>StructuredDataDirective (${declared})`);
	}
	return violations;
}
