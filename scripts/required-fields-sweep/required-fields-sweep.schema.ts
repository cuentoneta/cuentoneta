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
	/** Tipos nombrados del schema, para resolver las referencias `inline`. */
	readonly types: ReadonlyMap<string, SchemaNode>;
	/** Nombres en curso de resolución: corta un tipo que se referencia a sí mismo. */
	readonly resolving: Set<string>;
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
	if (node.type === 'inline') {
		descendInline(node, documentType, segments, insideArray, acc);
		return;
	}
	if (node.attributes) {
		collectAttributes(node, documentType, segments, insideArray, acc);
		return;
	}
	if (node.type === 'array') {
		descendArray(node, documentType, segments, insideArray, acc);
	}
}

// `schema.json` referencia por nombre todo tipo declarado aparte — `slug`, `markdown`, cada
// `*.reference` —, así que sin resolverlos el recorrido perdería sus campos requeridos sin decirlo:
// `slug.current` lo declara el tipo `slug`, no cada documento que lo usa.
function descendInline(
	node: SchemaNode,
	documentType: string,
	segments: readonly string[],
	insideArray: boolean,
	acc: Accumulator,
): void {
	const name = node.name;
	// Los internos de un tipo del sistema los escribe el Studio, no quien carga contenido: el recorte
	// y el foco de una imagen no son un dato editorial que alguien pueda incumplir, y descender ahí
	// llenaría el reporte de filas que nadie puede accionar.
	if (name?.startsWith('sanity.')) {
		return;
	}
	const resolved = name ? acc.types.get(name) : undefined;

	if (!name || !resolved) {
		acc.uncovered.push({ documentType, segments, reason: `tipo "${name ?? 'sin nombre'}" ausente del schema` });
		return;
	}
	// Un tipo que se contiene a sí mismo —`blockContent` anida bloques— haría girar el recorrido.
	if (acc.resolving.has(name)) {
		return;
	}

	acc.resolving.add(name);
	descend(attributeHolder(resolved), documentType, segments, insideArray, acc);
	acc.resolving.delete(name);
}

function descendArray(
	node: SchemaNode,
	documentType: string,
	segments: readonly string[],
	insideArray: boolean,
	acc: Accumulator,
): void {
	const member = node.of;
	// Un array de uniones tiene tantas formas como miembros, y el predicado no puede distinguirlas sin
	// ramificar por `_type`. Se chequea antes que el anidamiento porque una unión lo es igual estando
	// anidada, y nombrar la razón precisa es lo que hace accionable el punto ciego.
	if (member?.type === 'union') {
		acc.uncovered.push({ documentType, segments, reason: 'no se desciende: array de tipos unión' });
		return;
	}
	// El predicado de conteo sabe filtrar un array por su contenido, pero no anidar un segundo filtro
	// adentro: emitiría una consulta válida que cuenta otra cosa, sin fallar. Que el atributo exista sí
	// se mide; lo que no se mira es lo que hay dentro.
	if (insideArray) {
		acc.uncovered.push({ documentType, segments, reason: 'no se desciende: array dentro de otro array' });
		return;
	}
	descend(member, documentType, segments, true, acc);
}

export function scanRequiredFields(schema: readonly SchemaNode[]): RequiredFieldsScan {
	const types = new Map(schema.filter((entry) => entry.name).map((entry) => [entry.name as string, entry]));
	const acc: Accumulator = { required: [], uncovered: [], types, resolving: new Set() };

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
