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

	it.each([
		['un TODO puesto después del número', '// Rediseñado en #1234: antes usaba otra proyección. TODO: revisar'],
		['una supresión nombrada después del número', '// El eslint-disable de abajo viene de #1234'],
	])('no se deja excusar por %s, que no lo ampara', (_caso, linea) => {
		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it('ignora `todo` en minúsculas, que es prosa y no un marcador', () => {
		const linea = '// todo esto se reemplaza cuando cierre #1234';

		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it('marca un issue de número bajo, que en un proyecto recién clonado son todos los que hay', () => {
		const linea = '// Rediseñado en #7: antes usaba otra proyección';

		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it.each([
		['con la palabra que lo contextualiza', '// no hay fallback silencioso (finding S3)'],
		['en español', '// corregido según el hallazgo R6 de la review'],
		['pelado, que es el más huérfano de todos', '// ver S3'],
	])('marca un identificador de hallazgo %s', (_caso, linea) => {
		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it('asume el costo del nombre de producto homónimo — se lo nombra por su producto, no por su sigla', () => {
		const linea = '// el bucket R2 sirve los assets estáticos';

		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
	});

	it('marca el hallazgo aunque la línea sea un TODO: las excepciones amparan issues, no hallazgos', () => {
		const linea = '// TODO: revisar el hallazgo S3 antes de shippear';

		expect(findIssueRefsInComments(file, linea)).toEqual([linea]);
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

	it.each([
		['.mjs', 'src/tools/build.mjs'],
		['.cjs', 'src/tools/build.cjs'],
	])('sí mira %s, que también es código', (_caso, ruta) => {
		expect(findIssueRefsInComments(ruta, '// Rediseñado en #1234')).toEqual(['// Rediseñado en #1234']);
	});

	it('normaliza los separadores de Windows', () => {
		const linea = '// Rediseñado en #1234';

		expect(findIssueRefsInComments('C:\\repo\\src\\app\\widget.ts', linea)).toEqual([linea]);
	});
});
