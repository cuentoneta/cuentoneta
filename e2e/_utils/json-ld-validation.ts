/**
 * Validación estructural de bloques JSON-LD de schema.org (más allá de la parseabilidad).
 *
 * Dos comprobaciones complementarias, ambas sin red:
 *  1. `jsonld.expand` con un documentLoader hermético (mapea `https://schema.org` a un `@vocab`
 *     local): detecta JSON-LD incoherente y `@context` rotos sin salir a internet.
 *  2. Un registro de propiedades requeridas por `@type`, recorrido de forma recursiva sobre los
 *     nodos anidados (autor, publisher, ItemList, ListItem), que afirma las señales que schema.org
 *     no marca como obligatorias pero los answer engines esperan (p. ej. `Article.datePublished`).
 *
 * Framework-agnóstico (solo `jsonld`): reutilizable desde los specs unit (Vitest), los e2e
 * (Playwright) y el core de invariantes SSR (`seo-invariants.ts`).
 */
import * as jsonld from 'jsonld';
import type { JsonLdDocument, NodeObject } from 'jsonld';

import type { Violation } from './seo-invariants';

// Contexto local con `@vocab` schema.org: la expansión mapea cualquier término a un IRI schema.org
// sin descargar el contexto real (los términos válidos ya los garantiza `schema-dts` en compile-time).
const SCHEMA_ORG_VOCAB_CONTEXT: NodeObject = { '@context': { '@vocab': 'https://schema.org/' } };

// Propiedades que cada `@type` que emitimos debe llevar. schema.org no las marca requeridas, pero su
// ausencia degrada el rich result / la respuesta del answer engine, así que acá sí son obligatorias.
const REQUIRED_PROPERTIES: Record<string, readonly string[]> = {
	Organization: ['name', 'url'],
	WebSite: ['name', 'url'],
	Person: ['name'],
	Article: ['headline', 'datePublished', 'author', 'publisher'],
	ProfilePage: ['mainEntity'],
	CollectionPage: ['name', 'url', 'mainEntity'],
	ItemList: ['itemListElement'],
	BreadcrumbList: ['itemListElement'],
	ListItem: ['position', 'name'],
};

function violation(message: string): Violation {
	return { rule: 'json-ld', message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEmpty(value: unknown): boolean {
	return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

async function hermeticDocumentLoader(url: string): Promise<{ documentUrl: string; document: NodeObject }> {
	if (/^https?:\/\/schema\.org\/?$/.test(url)) {
		return { documentUrl: url, document: SCHEMA_ORG_VOCAB_CONTEXT };
	}
	throw new Error(
		`documentLoader hermético: no se resuelve "${url}" (el JSON-LD debe usar @context https://schema.org).`,
	);
}

async function expandViolations(schema: Record<string, unknown>): Promise<Violation[]> {
	try {
		const expanded = await jsonld.expand(schema as JsonLdDocument, { documentLoader: hermeticDocumentLoader });
		return expanded.length === 0
			? [violation('jsonld.expand devolvió un documento vacío (¿@context/@type inválidos?).')]
			: [];
	} catch (error) {
		return [violation(`jsonld.expand falló: ${messageOf(error)}`)];
	}
}

// Recorre un nodo (y sus hijos) exigiendo las propiedades de su `@type`. Los records sin `@type` pero
// con `@id` son referencias por IRI válidas (p. ej. `ListItem.item`) y se omiten; el resto sin `@type`
// se reporta. Los `@type` fuera del registro (typos, tipos no soportados) también se reportan.
function validateNode(node: unknown, path: string): Violation[] {
	if (Array.isArray(node)) {
		return node.flatMap((item, index) => validateNode(item, `${path}[${index}]`));
	}
	if (!isRecord(node)) {
		return [];
	}
	const type = node['@type'];
	if (typeof type !== 'string') {
		return typeof node['@id'] === 'string' ? [] : [violation(`${path}: falta @type.`)];
	}
	const required = REQUIRED_PROPERTIES[type];
	if (!required) {
		return [violation(`${path}: @type "${type}" no reconocido (¿typo o tipo no soportado?).`)];
	}
	return [...requiredViolations(node, type, required, path), ...childrenViolations(node, path)];
}

function requiredViolations(
	node: Record<string, unknown>,
	type: string,
	required: readonly string[],
	path: string,
): Violation[] {
	const missing = required
		.filter((property) => isEmpty(node[property]))
		.map((property) => violation(`${path} (${type}): falta la propiedad requerida "${property}".`));
	// Un ListItem identifica su destino con `item` (breadcrumb) o `url` (ItemList); exigimos al menos uno.
	if (type === 'ListItem' && isEmpty(node['item']) && isEmpty(node['url'])) {
		missing.push(violation(`${path} (ListItem): falta "item" o "url".`));
	}
	return missing;
}

function childrenViolations(node: Record<string, unknown>, path: string): Violation[] {
	return Object.entries(node)
		.filter(([key]) => !key.startsWith('@'))
		.flatMap(([key, value]) => validateNode(value, `${path}.${key}`));
}

/**
 * Devuelve todas las violaciones estructurales de un bloque JSON-LD ya parseado: `@context`
 * schema.org, coherencia por `jsonld.expand` y propiedades requeridas por tipo (recursivo).
 */
export async function validateJsonLd(schema: unknown): Promise<Violation[]> {
	if (!isRecord(schema)) {
		return [violation('El bloque JSON-LD no es un objeto.')];
	}
	const violations: Violation[] = [];
	if (schema['@context'] !== 'https://schema.org') {
		violations.push(
			violation(
				`@context inválido: se esperaba "https://schema.org", se encontró ${JSON.stringify(schema['@context'])}.`,
			),
		);
	}
	violations.push(...(await expandViolations(schema)));
	violations.push(...validateNode(schema, '$'));
	return violations;
}

/** Afirma que un bloque JSON-LD es schema.org válido; lanza con el detalle de las violaciones si no. */
export async function assertValidJsonLd(schema: unknown): Promise<void> {
	const violations = await validateJsonLd(schema);
	if (violations.length > 0) {
		throw new Error(`JSON-LD inválido:\n${violations.map((v) => `  - ${v.message}`).join('\n')}`);
	}
}
