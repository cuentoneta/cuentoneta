/** Documento tal como lo transporta el `data.ndjson` de un export, o como lo devuelve una lectura `raw`. */
export type SanityDocument = { readonly _id: string; readonly _rev?: string; readonly [field: string]: unknown };

type PathSegment = string | number;
type JsonObject = Record<string, unknown>;

interface ReferenceSlot {
	readonly path: string;
	readonly weak: boolean;
}

/** Lo que el origen exige de un documento: qué referencias son fuertes y dónde tiene un asset. */
export interface SourceEntry {
	readonly strongPaths: ReadonlySet<string>;
	readonly assetPaths: readonly string[];
}

/**
 * Qué le falta a un documento del destino para igualar a su origen.
 *
 * `unsetPaths` ya apunta al `_weak` de cada referencia, listo para un `unset`; vacío significa que no
 * hay nada que fortalecer. `unresolvedAssets` son los slots que el origen exporta como asset y que en
 * el destino no quedaron enlazados a ninguno.
 */
export type DocumentDiff =
	| { readonly kind: 'missing' }
	| {
			readonly kind: 'present';
			readonly rev: string;
			readonly unsetPaths: readonly string[];
			readonly unresolvedAssets: readonly string[];
	  };

/**
 * Serializa un path con el mismo formato que `@sanity/import`: índices como `[n]`, claves numéricas
 * como `["n"]` y el resto separado por puntos. Tiene que coincidir con el del import, porque es el que
 * entiende el `unset` de una mutación.
 */
export function serializePath(path: readonly PathSegment[]): string {
	return path.reduce<string>((serialized, segment, index) => {
		if (typeof segment === 'number') {
			return `${serialized}[${segment}]`;
		}
		if (Number.isFinite(Number(segment))) {
			return `${serialized}["${segment}"]`;
		}
		return index === 0 ? segment : `${serialized}.${segment}`;
	}, '');
}

/**
 * Dice si el import escribe el documento en el destino. Excluye los documentos de sistema (`_.`),
 * salvo los de releases y variants, que el import crea por acciones dedicadas.
 */
export function isImportedDocument(doc: SanityDocument): boolean {
	const id = doc._id;
	return !id.startsWith('_.') || id.startsWith('_.releases.') || id.startsWith('_.variants.');
}

function isJsonObject(node: unknown): node is JsonObject {
	return typeof node === 'object' && node !== null && !Array.isArray(node);
}

// Recorre todo objeto a cualquier profundidad, como el `..` de las expresiones que usa el import.
function visitObjects(node: unknown, path: PathSegment[], visit: (object: JsonObject, path: PathSegment[]) => void) {
	if (Array.isArray(node)) {
		node.forEach((item, index) => visitObjects(item, [...path, index], visit));
		return;
	}
	if (!isJsonObject(node)) {
		return;
	}
	visit(node, path);
	for (const [key, value] of Object.entries(node)) {
		visitObjects(value, [...path, key], visit);
	}
}

function findReferenceSlots(doc: SanityDocument): ReferenceSlot[] {
	const slots: ReferenceSlot[] = [];
	visitObjects(doc, [], (object, path) => {
		if ('_ref' in object) {
			slots.push({ path: serializePath(path), weak: object['_weak'] === true });
		}
	});
	return slots;
}

function findPathsWhere(doc: SanityDocument, matches: (object: JsonObject) => boolean): string[] {
	const paths: string[] = [];
	visitObjects(doc, [], (object, path) => {
		if (matches(object)) {
			paths.push(serializePath(path));
		}
	});
	return paths;
}

/**
 * Indexa por `_id` los documentos que el import escribe. Una referencia débil en el origen no entra en
 * `strongPaths`: es débil a propósito y tiene que seguir así en el destino.
 */
export function buildSourceIndex(docs: Iterable<SanityDocument>): Map<string, SourceEntry> {
	const exportsAnAsset = (object: JsonObject) => '_sanityAsset' in object;
	const index = new Map<string, SourceEntry>();
	for (const doc of docs) {
		if (!isImportedDocument(doc)) {
			continue;
		}
		const strongPaths = findReferenceSlots(doc)
			.filter((slot) => !slot.weak)
			.map((slot) => slot.path);
		index.set(doc._id, { strongPaths: new Set(strongPaths), assetPaths: findPathsWhere(doc, exportsAnAsset) });
	}
	return index;
}

/** Compara un documento del destino con su origen; `undefined` es un documento que el destino no tiene. */
export function diffAgainstDestination(source: SourceEntry, destination: SanityDocument | undefined): DocumentDiff {
	if (!destination) {
		return { kind: 'missing' };
	}
	const unsetPaths = findReferenceSlots(destination)
		.filter((slot) => slot.weak && source.strongPaths.has(slot.path))
		.map((slot) => `${slot.path}._weak`);
	const linksAnAsset = (object: JsonObject) => isJsonObject(object['asset']) && '_ref' in object['asset'];
	const linkedAssets = new Set(findPathsWhere(destination, linksAnAsset));
	const unresolvedAssets = source.assetPaths.filter((path) => !linkedAssets.has(path));
	return { kind: 'present', rev: destination._rev ?? '', unsetPaths, unresolvedAssets };
}
