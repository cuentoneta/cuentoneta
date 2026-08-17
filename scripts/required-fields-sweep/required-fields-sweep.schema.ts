// Deriva de `cms/schema.json` —la misma fuente que consume el typegen— qué atributos declara
// requeridos cada tipo de documento. Derivarlos en vez de enumerarlos a mano es lo que hace que un
// campo requerido nuevo entre al barrido en el mismo PR que lo declara.

// Tipado estructural mínimo del schema extraído: alcanza para el recorrido sin acoplar el modelo
// interno del extractor, que no publica tipos.
interface SchemaNode {
	readonly type: string;
	readonly name?: string;
	readonly value?: SchemaNode;
	readonly of?: SchemaNode;
	readonly attributes?: Readonly<Record<string, SchemaNode>>;
	readonly optional?: boolean;
}

export interface RequiredFieldPath {
	/** Tipo de documento donde vive el campo. */
	readonly documentType: string;
	/** Segmentos desde la raíz del documento hasta el atributo. */
	readonly segments: readonly string[];
	/** Verdadero cuando algún segmento intermedio es un array de objetos. */
	readonly insideArray: boolean;
}

/** Un tipo que el recorrido no sabe descender, y que por eso queda fuera de la cobertura. */
export interface UncoveredPath {
	readonly documentType: string;
	readonly segments: readonly string[];
	readonly reason: string;
}

export interface RequiredFieldsScan {
	readonly required: readonly RequiredFieldPath[];
	readonly uncovered: readonly UncoveredPath[];
}

// Los campos de sistema los escribe el content lake, no el editor: nunca faltan y reportarlos sería
// ruido en todas las filas.
const systemFields = new Set(['_id', '_type', '_rev', '_key', '_createdAt', '_updatedAt']);

// Una referencia se declara requerida en el documento que la contiene; sus atributos internos
// (`_ref`, `_type`) los gobierna el content lake, así que descender ahí no aporta.
function isReference(node: SchemaNode): boolean {
	return node.type === 'object' && 'dereferencesTo' in node;
}

function isDocumentType(node: SchemaNode): boolean {
	return node.type === 'document' || node.value?.type === 'document';
}

// Un tipo de documento lleva sus atributos colgando de sí mismo; un tipo objeto los lleva bajo
// `value`. El recorrido entra por el mismo lugar en los dos casos.
function attributeHolder(entry: SchemaNode): SchemaNode {
	return entry.attributes ? entry : (entry.value ?? entry);
}

interface Accumulator {
	readonly required: RequiredFieldPath[];
	readonly uncovered: UncoveredPath[];
}

function collectAttributes(
	node: SchemaNode,
	documentType: string,
	segments: readonly string[],
	insideArray: boolean,
	acc: Accumulator,
): void {
	for (const [name, attribute] of Object.entries(node.attributes ?? {})) {
		if (systemFields.has(name)) {
			continue;
		}
		const path = [...segments, name];
		if (attribute.optional !== true) {
			acc.required.push({ documentType, segments: path, insideArray });
		}
		descend(attribute.value, documentType, path, insideArray, acc);
	}
}

function descend(
	node: SchemaNode | undefined,
	documentType: string,
	segments: readonly string[],
	insideArray: boolean,
	acc: Accumulator,
): void {
	if (!node || isReference(node)) {
		return;
	}
	if (node.attributes) {
		collectAttributes(node, documentType, segments, insideArray, acc);
		return;
	}
	if (node.type === 'array') {
		descendArray(node, documentType, segments, acc);
	}
}

function descendArray(node: SchemaNode, documentType: string, segments: readonly string[], acc: Accumulator): void {
	const member = node.of;
	// Un array de uniones tiene tantas formas como miembros, y el predicado de conteo no puede
	// distinguirlas sin ramificar por `_type`. Se declara el punto ciego en vez de omitirlo: uno
	// visible es accionable, uno silencioso reproduce el problema que este barrido existe para cerrar.
	if (member?.type === 'union') {
		acc.uncovered.push({ documentType, segments, reason: 'array de tipos unión' });
		return;
	}
	descend(member, documentType, segments, true, acc);
}

export function scanRequiredFields(schema: readonly SchemaNode[]): RequiredFieldsScan {
	const acc: Accumulator = { required: [], uncovered: [] };

	for (const entry of schema) {
		// Los tipos del sistema (`sanity.imageAsset`, `sanity.fileAsset`) los gestiona el content lake:
		// sus campos requeridos no son contenido que nadie de este proyecto cargue ni pueda corregir.
		if (!entry.name || entry.name.startsWith('sanity.') || !isDocumentType(entry)) {
			continue;
		}
		descend(attributeHolder(entry), entry.name, [], false, acc);
	}

	return { required: acc.required, uncovered: acc.uncovered };
}
