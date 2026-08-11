import { describe, expect, it } from 'vitest';

import { SYNTAX_BY_EXTENSION, extractComments, type CommentSyntax } from './extract-comments.helpers';

const TYPESCRIPT: CommentSyntax = SYNTAX_BY_EXTENSION['.ts'];
const MARKDOWN: CommentSyntax = SYNTAX_BY_EXTENSION['.md'];
const SHELL: CommentSyntax = SYNTAX_BY_EXTENSION['.sh'];

describe('extractComments', () => {
	it('clasifica comentario de línea, de bloque y de documentación', () => {
		const source = ['// suelto', '/* bloque */', '/** contrato */', 'const a = 1;'].join('\n');

		expect(extractComments('a.ts', source, TYPESCRIPT).map(({ kind, text }) => ({ kind, text }))).toEqual([
			{ kind: 'line', text: '// suelto' },
			{ kind: 'block', text: '/* bloque */' },
			{ kind: 'doc', text: '/** contrato */' },
		]);
	});

	it('no cuenta como comentario un marcador que vive dentro de un literal de string', () => {
		const source = ['const url = "https://ejemplo.test";', "const hash = '# no es comentario';"].join('\n');

		expect(extractComments('a.ts', source, TYPESCRIPT)).toEqual([]);
	});

	it('atraviesa un template literal multilínea sin perder la cuenta de las líneas', () => {
		const source = ['const t = `primera', 'segunda`;', '// después'].join('\n');

		expect(extractComments('a.ts', source, TYPESCRIPT)).toEqual([
			{ file: 'a.ts', line: 3, endLine: 3, kind: 'line', text: '// después' },
		]);
	});

	it('cierra un literal de comilla simple al fin de línea en vez de comerse el resto del archivo', () => {
		// Una comilla sin cerrar es un error de sintaxis; darla por terminada acota el daño al renglón.
		const source = ["const roto = 'sin cerrar", '// sigue siendo un comentario'].join('\n');

		expect(extractComments('a.ts', source, TYPESCRIPT)).toEqual([
			{ file: 'a.ts', line: 2, endLine: 2, kind: 'line', text: '// sigue siendo un comentario' },
		]);
	});

	it('numera las líneas de un bloque multilínea por su apertura y su cierre', () => {
		const source = ['const a = 1;', '/* abre', 'sigue', 'cierra */', '// final'].join('\n');

		expect(extractComments('a.ts', source, TYPESCRIPT).map(({ line, endLine }) => ({ line, endLine }))).toEqual([
			{ line: 2, endLine: 4 },
			{ line: 5, endLine: 5 },
		]);
	});

	it('extiende hasta el fin de archivo un bloque que nunca cierra', () => {
		const source = ['const a = 1;', '/* abre y no cierra'].join('\n');
		const [comment] = extractComments('a.ts', source, TYPESCRIPT);

		expect(comment).toEqual({
			file: 'a.ts',
			line: 2,
			endLine: 2,
			kind: 'block',
			text: '/* abre y no cierra',
		});
	});

	it('ignora el shebang de la primera línea, pero no un numeral posterior', () => {
		const source = ['#!/usr/bin/env bash', '# esto sí es un comentario'].join('\n');

		expect(extractComments('a.sh', source, SHELL)).toEqual([
			{ file: 'a.sh', line: 2, endLine: 2, kind: 'line', text: '# esto sí es un comentario' },
		]);
	});

	it('no trata las comillas de la prosa como literales en un lenguaje de marcado', () => {
		// El apóstrofo de "d'Onoff" abriría un literal que no cierra nunca, y el comentario siguiente
		// quedaría invisible. Es la razón de ser de `hasStringLiterals`.
		const source = ['Prosa con apóstrofo d\'Onoff y comillas "sueltas".', '<!-- nota editorial -->'].join('\n');

		expect(extractComments('a.md', source, MARKDOWN)).toEqual([
			{ file: 'a.md', line: 2, endLine: 2, kind: 'block', text: '<!-- nota editorial -->' },
		]);
	});

	it('devuelve vacío para un archivo sin comentarios', () => {
		expect(extractComments('a.ts', 'export const answer = 42;\n', TYPESCRIPT)).toEqual([]);
	});
});
