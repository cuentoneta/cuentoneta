import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
	CONVENTION_SOURCES,
	findExemptIssueRefs,
	findIssueRefsInComments,
	isConventionSource,
} from './block-issue-refs-in-comments.helpers';

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
		['fuera de src/, cms/ y scripts/', 'e2e/_utils/seo-invariants.ts'],
		['una extensión que no es de código', 'src/mocks/onoff/README.md'],
		['un archivo que define esta convención', 'scripts/check-issue-refs.ts'],
	])('no mira %s', (_caso, ruta) => {
		expect(findIssueRefsInComments(ruta, '// Rediseñado en #1234')).toEqual([]);
	});

	it('mira los archivos de scripts/ que no definen la convención', () => {
		expect(findIssueRefsInComments('scripts/backfill-reading-time.ts', '// Rediseñado en #1234')).toEqual([
			'// Rediseñado en #1234',
		]);
	});

	it.each([
		['.mjs', 'src/tools/build.mjs'],
		['.cjs', 'src/tools/build.cjs'],
		['.tsx del Studio', 'cms/components/LandingPageListPane.tsx'],
		['un schema del Studio, que no cuelga de un src/', 'cms/schemas/literaryWork.ts'],
		['una migración del Studio', 'cms/migrations/purge-orphan-properties/index.ts'],
	])('sí mira %s, que también es código', (_caso, ruta) => {
		expect(findIssueRefsInComments(ruta, '// Rediseñado en #1234')).toEqual(['// Rediseñado en #1234']);
	});

	it('normaliza los separadores de Windows', () => {
		const linea = '// Rediseñado en #1234';

		expect(findIssueRefsInComments('C:\\repo\\src\\app\\widget.ts', linea)).toEqual([linea]);
	});
});

describe('findExemptIssueRefs — la operación inversa', () => {
	const file = 'src/app/components/widget/widget.component.ts';

	it.each([
		['un TODO con paréntesis', '// TODO(#1471): eliminar el adapter', 1471, 'todo'],
		['un TODO con el número al final', '// TODO: eliminar el adapter (ver #1471)', 1471, 'todo'],
		['una supresión de ESLint', '/* eslint-disable no-restricted-syntax -- se migra en #1503 */', 1503, 'suppression'],
		['una supresión de TS', '// @ts-expect-error -- se resuelve en #1503', 1503, 'suppression'],
	])('devuelve %s con su número y su tipo', (_caso, linea, numero, kind) => {
		expect(findExemptIssueRefs(file, linea)).toEqual([{ lineNumber: 1, line: linea, issueNumber: numero, kind }]);
	});

	it('devuelve una entrada por número cuando la línea cita varios', () => {
		const salida = findExemptIssueRefs(file, '// TODO(#1471): depende también de #1503');

		expect(salida.map((ref) => ref.issueNumber)).toEqual([1471, 1503]);
	});

	it('no devuelve una línea ofensora: esa la cubre el hook, no es una excepción vigente', () => {
		expect(findExemptIssueRefs(file, '// Rediseñado en #1471: antes usaba otra proyección')).toEqual([]);
	});

	it('no ampara una línea que además cita un identificador de hallazgo', () => {
		expect(findExemptIssueRefs(file, '// TODO(#1471): revisar el hallazgo S3')).toEqual([]);
	});

	it('reporta el número de línea real dentro de un archivo', () => {
		const contenido = ['const x = 1;', '', '// TODO(#1471): sacar esto'].join('\n');

		expect(findExemptIssueRefs(file, contenido)[0].lineNumber).toBe(3);
	});

	it.each([
		['fuera de src/, cms/ y scripts/', 'e2e/_utils/seo-invariants.ts'],
		['una extensión que no es de código', 'src/mocks/onoff/README.md'],
		['un archivo que define esta convención', 'scripts/check-issue-refs.ts'],
	])('no mira %s', (_caso, ruta) => {
		expect(findExemptIssueRefs(ruta, '// TODO(#1471): algo')).toEqual([]);
	});

	it('mira los archivos de scripts/ que no definen la convención', () => {
		// Sin esto, el sweep le preguntaría a GitHub por los números de los fixtures del propio checker.
		expect(findExemptIssueRefs('scripts/backfill-reading-time.ts', '// TODO(#1471): algo')).toHaveLength(1);
	});

	it('no arrastra estado entre llamadas, que es el modo de falla de una regex global compartida', () => {
		expect(findExemptIssueRefs(file, '// TODO(#1471): x')).toHaveLength(1);
		expect(findExemptIssueRefs(file, '// TODO(#1471): x')).toHaveLength(1);
	});
});

describe('isConventionSource', () => {
	const raiz = 'C:/repo';

	it('exime al archivo que define la convención cuando llega por ruta absoluta', () => {
		// Es la forma en que el hook recibe la ruta al correr; los casos de alcance usan relativas.
		expect(isConventionSource('C:\\repo\\scripts\\finding-refs.ts', raiz)).toBe(true);
		expect(isConventionSource('C:/repo/scripts/finding-refs.ts', raiz)).toBe(true);
	});

	it('no exime a un homónimo colgado de otra carpeta', () => {
		// Comparando por sufijo este archivo quedaba exento sin que nada lo señalara, y la allowlist
		// dejaba de decir lo que dice.
		expect(isConventionSource('C:/repo/src/scripts/finding-refs.ts', raiz)).toBe(false);
	});

	it('no exime a un archivo de scripts/ que no define la convención', () => {
		expect(isConventionSource('C:/repo/scripts/backfill-reading-time.ts', raiz)).toBe(false);
	});
});

describe('la allowlist de archivos que definen la convención', () => {
	// El gate cubre la dirección peligrosa —un archivo que cita sin estar allowlisted falla—, pero no la
	// inversa: una entrada que apunta a un archivo movido o renombrado exime a nadie y la lista deja de
	// decir lo que dice. Mover contenido entre archivos es justamente cuando se rompe.
	it.each([...CONVENTION_SOURCES])('apunta a un archivo que existe: %s', (ruta) => {
		expect(existsSync(resolve(process.cwd(), ruta))).toBe(true);
	});
});
