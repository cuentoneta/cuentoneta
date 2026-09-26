export type Substitution = {
	binding: string;
	specifier: string;
	kind: 'named' | 'default';
};

/**
 * Una **derivación**: un puñado de campos que otra fixture ya declara y que una expresión sabe volver a
 * producir. Donde una sustitución reemplaza un valor entero, ésta reemplaza una **parte** de un objeto:
 * el emisor escribe la expresión con spread y deja escritos solo los campos que no cubre.
 *
 * Es lo que permite que el teaser de una obra no repita lo que ya dice su raw completo, ni la landing lo
 * que ya dice el teaser. Los campos que la query **calcula** —el extracto, el conteo de una colección—
 * no salen de ningún lado y quedan literales.
 *
 * La coincidencia es por valor, igual que la sustitución: si la proyección se aparta, la derivación no
 * aplica y el objeto vuelve a escribirse entero. Que eso no pase en silencio lo verifica el spec del
 * corpus crudo, no el emisor.
 */
export type Derivation = {
	fields: Record<string, unknown>;
	expression: string;
	imports: Substitution[];
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

// La primera derivación que cubra al objeto, o ninguna. Cubrir es que cada campo que la derivación
// declara valga lo mismo acá: un objeto al que le falte uno, o que lo traiga distinto, no la acepta.
function derivationFor(value: Record<string, unknown>, derivations: readonly Derivation[]): Derivation | undefined {
	return derivations.find((derivation) =>
		Object.entries(derivation.fields).every(
			([key, field]) => key in value && substitutionKey(value[key]) === substitutionKey(field),
		),
	);
}

function emitValue(
	value: unknown,
	table: SubstitutionTable,
	used: Set<Substitution>,
	derivations: readonly Derivation[] = [],
): string {
	const substitution = table.get(substitutionKey(value));
	if (substitution) {
		used.add(substitution);
		return substitution.binding;
	}
	if (Array.isArray(value)) {
		return `[${value.map((item) => emitValue(item, table, used, derivations)).join(',')}]`;
	}
	if (isRecord(value)) {
		const derivation = derivationFor(value, derivations);
		const covered = new Set(Object.keys(derivation?.fields ?? {}));
		const fields = Object.entries(value)
			.filter(([key]) => !covered.has(key))
			.map(([key, item]) => `${emitKey(key)}:${emitValue(item, table, used, derivations)}`);

		if (!derivation) {
			return `{${fields.join(',')}}`;
		}

		derivation.imports.forEach((substitution) => used.add(substitution));
		return `{...${derivation.expression},${fields.join(',')}}`;
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
	// Por binding y no por objeto: varias derivaciones del mismo destino comparten la función que las
	// produce, y cada una la declara en su propia lista de imports.
	const named = [
		...new Set(
			substitutions
				.filter(({ kind }) => kind === 'named')
				.map(({ binding }) => binding)
				.sort(),
		),
	];

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
	derivations?: readonly Derivation[];
};

/**
 * La fuente del módulo generado, **sin formatear**: pasarla por Prettier con la config del repo es
 * responsabilidad del llamador. Si no lo hace, `pretty-quick` la reescribe en el `pre-commit` y el
 * archivo commiteado deja de ser byte a byte el que produjo la última corrida del generador.
 */
export function emitModule({
	banner,
	exportName,
	typeImport,
	typeAnnotation,
	typeSpecifier,
	value,
	table,
	derivations = [],
}: ModuleToEmit): string {
	const used = new Set<Substitution>();
	const body = emitValue(value, table, used, derivations);

	return [
		banner,
		emitImports(typeImport, typeSpecifier, used),
		'',
		`export const ${exportName}: ${typeAnnotation} = ${body};`,
		'',
	].join('\n');
}
