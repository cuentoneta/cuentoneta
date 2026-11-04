import { createHash } from 'node:crypto';

/** Documento tal como lo transporta el `data.ndjson` de un export, o como lo devuelve una lectura `raw`. */
export type SanityDocument = { readonly _id: string; readonly [field: string]: unknown };

/** Lee una página de documentos del dataset, ordenada por `_id` y posterior a `after`; vacía al terminar. */
export type PageFetcher = (after: string) => Promise<SanityDocument[]>;

type JsonObject = Record<string, unknown>;

/**
 * Traduce la ruta con la que el export guarda un asset al id que el import le da en el destino. El id
 * lleva el sha1 del archivo, así que dos ids iguales son el mismo binario.
 *
 *   image@file://./images/<sha1>-<ancho>x<alto>.<ext>  →  image-<sha1>-<ancho>x<alto>-<ext>
 *   file@file://./files/<sha1>-<ext>.bin               →  file-<sha1>-<ext>
 *   file@file://./files/<sha1>.<ext>                   →  file-<sha1>-<ext>
 *
 * El export usa la forma con `.bin` solo cuando la extensión lleva un dígito (`m4a`, `mp3`).
 */
export function assetIdFromExport(sanityAsset: string): string {
	const match = /^(image|file)@file:\/\/\.\/(?:images|files)\/([0-9a-f]+)[-.](.+)$/.exec(sanityAsset);
	if (!match) {
		throw new Error(`Asset exportado con una forma desconocida: "${sanityAsset}"`);
	}
	const [, type, sha1, rest] = match;
	return `${type}-${sha1}-${rest.replace(/\.bin$/, '').replace(/\.([^.]+)$/, '-$1')}`;
}

/** Dice si el import escribe el documento: excluye los de sistema (`_.`), salvo releases y variants. */
export function isImportedDocument(doc: SanityDocument): boolean {
	const id = doc._id;
	return !id.startsWith('_.') || id.startsWith('_.releases.') || id.startsWith('_.variants.');
}

function isJsonObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Lleva cada slot de asset del export a la forma en que queda en el destino, y ordena las claves para
// que el JSON no dependa del orden en que las escribió cada lado.
function canonical(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(canonical);
	}
	if (!isJsonObject(value)) {
		return value;
	}
	const { _sanityAsset, ...rest } = value;
	const fields: JsonObject =
		typeof _sanityAsset === 'string'
			? { ...rest, asset: { _ref: assetIdFromExport(_sanityAsset), _type: 'reference' } }
			: rest;
	return Object.fromEntries(
		Object.keys(fields)
			.sort()
			.map((key) => [key, canonical(fields[key])]),
	);
}

/**
 * Hash del contenido de un documento. Ignora `_rev` y `_updatedAt`, que cambian con cada escritura
 * aunque el contenido sea el mismo, y trata igual un asset exportado y el que el import enlazó.
 */
export function documentHash(doc: SanityDocument): string {
	const content = Object.fromEntries(Object.entries(doc).filter(([key]) => key !== '_rev' && key !== '_updatedAt'));
	return createHash('sha256').update(JSON.stringify(canonical(content))).digest('hex');
}

/** Hash de cada documento que el import escribe, por `_id`. */
export function hashDocuments(docs: Iterable<SanityDocument>): Map<string, string> {
	const hashes = new Map<string, string>();
	for (const doc of docs) {
		if (isImportedDocument(doc)) {
			hashes.set(doc._id, documentHash(doc));
		}
	}
	return hashes;
}

/** Hash del dataset entero: no depende del orden de los documentos y cambia si sobra o falta alguno. */
export function datasetHash(hashes: ReadonlyMap<string, string>): string {
	const lines = [...hashes].sort(([a], [b]) => (a < b ? -1 : 1)).map(([id, hash]) => `${id} ${hash}\n`);
	return createHash('sha256').update(lines.join('')).digest('hex');
}

/** Los `_id` que están en un solo lado o cuyo contenido difiere, ordenados. */
export function differingIds(expected: ReadonlyMap<string, string>, actual: ReadonlyMap<string, string>): string[] {
	const ids = new Set([...expected.keys(), ...actual.keys()]);
	return [...ids].filter((id) => expected.get(id) !== actual.get(id)).sort();
}

/** Recorre el dataset de a una página hasta que vuelva vacía. */
export async function readAllDocuments(fetchPage: PageFetcher): Promise<SanityDocument[]> {
	const docs: SanityDocument[] = [];
	for (let page = await fetchPage(''); page.length > 0; page = await fetchPage(docs[docs.length - 1]?._id ?? '')) {
		docs.push(...page);
	}
	return docs;
}
