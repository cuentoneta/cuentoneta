export type Substitution = {
	binding: string;
	specifier: string;
	kind: 'named' | 'default';
};

/**
 * Tabla indexada por el **valor serializado**, no por el tipo: así una misma pasada sustituye tanto la
 * prosa de un `.md` como el objeto entero de una etiqueta o del autor, que son piezas del corpus escritas
 * a mano y que el archivo generado tiene que seguir importando en vez de duplicar.
 */
export type SubstitutionTable = Map<string, Substitution>;

export function substitutionKey(value: unknown): string {
	return JSON.stringify(value);
}

/**
 * Corta ante dos piezas a mano que declaran el mismo valor. Sin esto, la última gana en silencio y cuál
 * es "la última" lo decide el orden en que el sistema de archivos devuelve los módulos: el archivo
 * generado importaría un binding en una máquina y otro en CI, con un diff que ningún gate explica.
 */
export function buildSubstitutionTable(entries: { value: unknown; substitution: Substitution }[]): SubstitutionTable {
	const table: SubstitutionTable = new Map();

	for (const { value, substitution } of entries) {
		const key = substitutionKey(value);
		const previous = table.get(key);
		if (previous && previous.binding !== substitution.binding) {
			throw new Error(
				`Dos piezas del corpus declaran el mismo valor: "${previous.binding}" (${previous.specifier}) y ` +
					`"${substitution.binding}" (${substitution.specifier}). Dejá una sola y que la otra la importe.`,
			);
		}
		table.set(key, substitution);
	}

	return table;
}

// El escapado lo hace `JSON.stringify` y no un reemplazo propio: la prosa del corpus trae CRLF, y un
// `\r` sin escapar termina un literal de string igual que un `\n`. Prettier normaliza después las
// comillas dobles a la convención del repo.
function quote(text: string): string {
	return JSON.stringify(text);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Un identificador simple puede ir sin comillas; el resto de las claves (las que GROQ produce con un
// alias entre comillas, por ejemplo) las necesitan.
function emitKey(key: string): string {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : quote(key);
}

function emitValue(value: unknown, table: SubstitutionTable, used: Set<Substitution>): string {
	const substitution = table.get(substitutionKey(value));
	if (substitution) {
		used.add(substitution);
		return substitution.binding;
	}
	if (Array.isArray(value)) {
		return `[${value.map((item) => emitValue(item, table, used)).join(',')}]`;
	}
	if (isRecord(value)) {
		const fields = Object.entries(value).map(([key, item]) => `${emitKey(key)}:${emitValue(item, table, used)}`);
		return `{${fields.join(',')}}`;
	}
	if (typeof value === 'string') {
		return quote(value);
	}
	return JSON.stringify(value) ?? 'undefined';
}

function emitImports(typeImport: string, typeSpecifier: string, used: Set<Substitution>): string {
	const bySpecifier = new Map<string, Substitution[]>();
	for (const substitution of used) {
		bySpecifier.set(substitution.specifier, [...(bySpecifier.get(substitution.specifier) ?? []), substitution]);
	}

	const lines = [...bySpecifier.entries()]
		.sort(([left], [right]) => (left < right ? -1 : 1))
		.map(([specifier, substitutions]) => emitImportLine(specifier, substitutions));

	return [`import type { ${typeImport} } from '${typeSpecifier}';`, ...lines].join('\n');
}

function emitImportLine(specifier: string, substitutions: Substitution[]): string {
	const defaults = substitutions.filter(({ kind }) => kind === 'default');
	const named = substitutions
		.filter(({ kind }) => kind === 'named')
		.map(({ binding }) => binding)
		.sort();

	const clauses = [...defaults.map(({ binding }) => binding), ...(named.length > 0 ? [`{ ${named.join(', ')} }`] : [])];
	return `import ${clauses.join(', ')} from '${specifier}';`;
}

export type ModuleToEmit = {
	banner: string;
	exportName: string;
	// El nombre que se importa y la anotación no coinciden cuando la query puede no encontrar nada:
	// se importa `LiteraryWorkBySlugQueryResult` y se anota `NonNullable<...>`.
	typeImport: string;
	typeAnnotation: string;
	typeSpecifier: string;
	value: unknown;
	table: SubstitutionTable;
};

export function emitModule({
	banner,
	exportName,
	typeImport,
	typeAnnotation,
	typeSpecifier,
	value,
	table,
}: ModuleToEmit): string {
	const used = new Set<Substitution>();
	const body = emitValue(value, table, used);

	return [
		banner,
		emitImports(typeImport, typeSpecifier, used),
		'',
		`export const ${exportName}: ${typeAnnotation} = ${body};`,
		'',
	].join('\n');
}
