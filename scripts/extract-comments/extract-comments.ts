/**
 * Inventario de comentarios: recorre las rutas que se le pasan y vuelca a JSON cada comentario que
 * encuentra, con su archivo, línea, tipo y texto. Lo consume el paso de inventario de la skill
 * `aposd-comment-audit`, que sobre esa salida mide la línea de base (comentarios por KLOC, cobertura
 * de doc-comments) antes de clasificar hallazgos.
 *
 * Reporta, no decide: **no es un gate**. Ningún workflow de CI lo corre y su salida no falla nada.
 * El criterio de escaneo vive en `extract-comments.helpers.ts`; acá están el recorrido del disco,
 * los argumentos y la escritura.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { parseArgs } from 'node:util';

import {
	EXCLUDED_DIRECTORIES,
	SYNTAX_BY_EXTENSION,
	extractComments,
	type CommentRecord,
} from './extract-comments.helpers';

// Bajo `workspace/`, que está gitignoreado: el inventario es un artefacto de sesión, y dejarlo caer
// en la raíz del repo lo pone a un `git add` de distancia de quedar versionado.
const DEFAULT_OUTPUT = 'workspace/comment-inventory.json';

/** Los archivos que cuelgan de `paths`, salteando los directorios que nunca aportan comentarios propios. */
function* walk(paths: readonly string[]): Generator<string> {
	const pending = [...paths];

	while (pending.length > 0) {
		const current = pending.pop();
		if (current === undefined) {
			return;
		}
		if (statSync(current).isFile()) {
			yield current;
			continue;
		}
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			if (entry.isDirectory() && !EXCLUDED_DIRECTORIES.has(entry.name)) {
				pending.push(join(current, entry.name));
			} else if (entry.isFile()) {
				yield join(current, entry.name);
			}
		}
	}
}

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: { out: { type: 'string', default: DEFAULT_OUTPUT } },
});

if (positionals.length === 0) {
	process.stderr.write('uso: pnpm comments:inventory <ruta> [<ruta>...] [--out <archivo.json>]\n');
	process.exit(1);
}

const comments: CommentRecord[] = [];
let scanned = 0;

for (const file of walk(positionals)) {
	const syntax = SYNTAX_BY_EXTENSION[extname(file).toLowerCase()];
	if (!syntax) {
		continue;
	}
	try {
		comments.push(...extractComments(file, readFileSync(file, 'utf8'), syntax));
		scanned++;
	} catch (error) {
		// Un archivo ilegible no invalida el inventario del resto; queda constancia de cuál se salteó.
		process.stderr.write(
			`aviso: ${file} no se pudo leer — ${error instanceof Error ? error.message : String(error)}\n`,
		);
	}
}

mkdirSync(dirname(values.out), { recursive: true });
writeFileSync(values.out, `${JSON.stringify(comments, null, 2)}\n`, 'utf8');
process.stdout.write(`${scanned} archivos escaneados · ${comments.length} comentarios → ${values.out}\n`);
