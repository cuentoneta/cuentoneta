import { findIssueRefsInComments } from './block-issue-refs-in-comments.helpers';

const file = 'src/app/components/widget/widget.component.ts';

describe('findIssueRefsInComments — lo que bloquea', () => {
	it.each([
		['rationale histórico', '// Rediseñado en #1234: antes usaba otra proyección'],
		['procedencia de una regla', '\t// la regla se agregó en #1234'],
		['número suelto en un comentario que no es TODO', '// Bloqueado por #1234: el deck usa @defer'],
		['comentario de bloque', '/* Ver #1234 para el contexto */'],
		['línea de continuación de un bloque', ' * y el detalle está en #1234'],
	])('marca %s', (_caso, linea) => {
		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it('marca la cita en la línea siguiente a un TODO, que es la vía obvia de eludir la regla', () => {
		const added = '// TODO: sacar este puente\n// cuando cierre #1234';

		expect(findIssueRefsInComments(file, added)).toEqual(['// cuando cierre #1234']);
	});

	it('devuelve todas las líneas ofensivas, no solo la primera', () => {
		const added = '// viene de #1234\nconst x = 1;\n// y también de #5678';

		expect(findIssueRefsInComments(file, added)).toHaveLength(2);
	});
});

describe('findIssueRefsInComments — lo que admite', () => {
	it.each([
		['TODO con paréntesis', '// TODO(#1234): eliminar el adapter temporal'],
		['TODO con dos puntos y el número al final', '// TODO: eliminar el adapter (ver #1234)'],
		['TODO dentro de un bloque JSDoc', ' * TODO(#1234): cambiar el provider'],
		['supresión de TS', '// @ts-ignore -- se resuelve en #1234'],
		['supresión de TS con expect-error', '// @ts-expect-error -- se resuelve en #1234'],
		['supresión de ESLint', '/* eslint-disable no-restricted-syntax -- se migra a DI en #1234 */'],
	])('admite %s', (_caso, linea) => {
		expect(findIssueRefsInComments(file, linea)).toEqual([]);
	});

	it('no confunde el doble slash de una URL con un comentario', () => {
		expect(findIssueRefsInComments(file, "const url = 'https://github.com/org/repo/issues/1234';")).toEqual([]);
	});

	it('ignora `todo` en minúsculas, que es prosa y no un marcador', () => {
		const linea = '// todo esto se reemplaza cuando cierre #1234';

		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it('no marca un número de menos de dos dígitos', () => {
		expect(findIssueRefsInComments(file, '// el paso #3 del algoritmo')).toEqual([]);
	});

	it('no marca código sin comentario', () => {
		expect(findIssueRefsInComments(file, "const anchor = '#1234';")).toEqual([]);
	});
});

describe('findIssueRefsInComments — alcance', () => {
	it.each([
		['fuera de src/', 'scripts/check-issue-refs.ts'],
		['una extensión que no es de código', 'src/mocks/onoff/README.md'],
	])('no mira %s', (_caso, ruta) => {
		expect(findIssueRefsInComments(ruta, '// Rediseñado en #1234')).toEqual([]);
	});

	it('normaliza los separadores de Windows', () => {
		const linea = '// Rediseñado en #1234';

		expect(findIssueRefsInComments('C:\\repo\\src\\app\\widget.ts', linea)).toEqual([linea]);
	});
});
