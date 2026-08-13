/**
 * La guarda previa del generador: inspecciona el **dataset de entrada**, no el resultado de ninguna
 * query, y por eso vive aparte del resto de las etapas.
 *
 * El orden importa y es el motivo de su existencia: corre **antes** de evaluar, así que una referencia
 * rota aborta la corrida entera en vez de dejar una fixture escrita con un `null` que nadie pidió. Si
 * corriera después no serviría de nada — sobre el resultado ya no se distingue un `null` legítimo de uno
 * que salió de un documento faltante.
 */
type SanityDocument = Record<string, unknown>;

export type DanglingReference = {
	ref: string;
	declaredBy: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/**
 * Ninguna query dereferencia un asset de imagen: proyectan el objeto entero y la URL la arma `urlFor` al
 * renderizar, fuera de GROQ. El único `->` sobre un asset es `audioFile.asset->url`. Sumar documentos de
 * imagen al corpus sería entonces inventar contenido que nada lee.
 *
 * Si alguna query llegara a dereferenciar una imagen, hay que sumar el documento del asset y quitar esta
 * exclusión: el gate de frescura no lo detectaría, porque al regenerar el null espurio queda de los dos
 * lados de la comparación.
 */
function isImageAsset(ref: string): boolean {
	return ref.startsWith('image-');
}

// Una referencia se declara de dos formas en un documento: el objeto `{ _type: 'reference', _ref }` y el
// `asset: { _ref }` de una imagen o un archivo, que no lleva `_type`.
function referencesOf(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.flatMap(referencesOf);
	}
	if (!isRecord(value)) {
		return [];
	}
	const own = typeof value['_ref'] === 'string' ? [value['_ref']] : [];
	return [...own, ...Object.values(value).flatMap(referencesOf)];
}

/**
 * `groq-js` resuelve a `null` toda referencia cuyo `_id` no esté en el dataset, sin lanzar: el fixture
 * derivado quedaría afirmando un `null` que el content lake nunca devolvería. Se verifica antes de
 * evaluar —sobre el dataset, no sobre el resultado— porque así no hay que adivinar qué `null` es legítimo.
 */
export function findDanglingReferences(dataset: SanityDocument[]): DanglingReference[] {
	const ids = new Set(dataset.map((document) => document['_id']).filter((id): id is string => typeof id === 'string'));

	return dataset.flatMap((document) => {
		const declaredBy = typeof document['_id'] === 'string' ? document['_id'] : '(documento sin _id)';
		return referencesOf(document)
			.filter((ref) => !isImageAsset(ref) && !ids.has(ref))
			.map((ref) => ({ ref, declaredBy }));
	});
}

export function assertEveryReferenceResolves(dataset: SanityDocument[]): void {
	const dangling = findDanglingReferences(dataset);
	if (dangling.length === 0) {
		return;
	}

	const detail = dangling.map(({ ref, declaredBy }) => `  - "${ref}", declarada por "${declaredBy}"`).join('\n');
	throw new Error(
		`El dataset tiene ${dangling.length} referencia(s) sin documento que las resuelva:\n${detail}\n` +
			'Sumá el documento faltante al corpus: sin él la query lo proyecta como null y la fixture generada mentiría.',
	);
}
