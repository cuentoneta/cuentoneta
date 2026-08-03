import { findFindingRefLines, hasFindingRef, matchFindingRefs } from './finding-refs';

describe('hasFindingRef', () => {
	it.each([
		['un identificador pelado, que es la cita más huérfana de todas', 'ver S3'],
		['uno con la palabra que lo contextualiza', 'no hay fallback silencioso (finding S3)'],
		['uno en español', 'corregido según el hallazgo R6 de la review'],
		['uno de varios dígitos', 'quedó pendiente el R12'],
	])('reconoce %s', (_caso, texto) => {
		expect(hasFindingRef(texto)).toBe(true);
	});

	it.each([
		['un token pegado a otra palabra', 'el parámetro maxR2 controla el tope'],
		['una letra fuera del conjunto cerrado', 'el hallazgo C4 no existe como prefijo'],
		['un prefijo sin número', 'la columna R quedó vacía'],
		['una mención a un issue, que es legítima', 'Closes #2091'],
	])('no reconoce %s', (_caso, texto) => {
		expect(hasFindingRef(texto)).toBe(false);
	});

	it('no confunde un identificador con un nombre propio que lo contiene', () => {
		expect(hasFindingRef('el androide R2D2 no es un hallazgo')).toBe(false);
	});

	it('no arrastra estado entre llamadas alternadas', () => {
		expect(hasFindingRef('ver S3')).toBe(true);
		expect(hasFindingRef('ver S3')).toBe(true);
		expect(hasFindingRef('texto limpio')).toBe(false);
		expect(hasFindingRef('ver S3')).toBe(true);
	});
});

describe('matchFindingRefs', () => {
	it('devuelve todos los identificadores de la línea, en orden', () => {
		expect(matchFindingRefs('quedan abiertos el R1, el R2 y el S10')).toEqual(['R1', 'R2', 'S10']);
	});

	it('devuelve vacío cuando no hay ninguno', () => {
		expect(matchFindingRefs('Acota la constante al cuerpo de la función')).toEqual([]);
	});

	it('no arrastra estado entre llamadas, que es el modo de falla de una regex global compartida', () => {
		expect(matchFindingRefs('ver R1 y R2')).toEqual(['R1', 'R2']);
		expect(matchFindingRefs('ver R1 y R2')).toEqual(['R1', 'R2']);
	});
});

describe('findFindingRefLines', () => {
	it('devuelve una entrada por línea ofensiva, con su número y sus identificadores', () => {
		const texto = [
			'Corrige el fallback del reading time',
			'',
			'Detectado como R6 en la review.',
			'Cierra también el S3.',
		].join('\n');

		expect(findFindingRefLines(texto)).toEqual([
			{ lineNumber: 3, line: 'Detectado como R6 en la review.', ids: ['R6'] },
			{ lineNumber: 4, line: 'Cierra también el S3.', ids: ['S3'] },
		]);
	});

	it('devuelve vacío para un texto limpio', () => {
		expect(findFindingRefLines('Acota la constante al cuerpo de la función\n\nEstaba a nivel de módulo.')).toEqual([]);
	});

	it('no marca las menciones a issues de un cuerpo de PR, que son legítimas y deseables', () => {
		const cuerpo = ['## Descripción', '', 'Cierra el hueco de cobertura.', '', 'Closes #2091.', 'Parte de #1472.'].join(
			'\n',
		);

		expect(findFindingRefLines(cuerpo)).toEqual([]);
	});

	it('parte por CRLF, que es como llega un mensaje de commit en Windows', () => {
		expect(findFindingRefLines('Primera línea\r\nDetectado como R6.')).toEqual([
			{ lineNumber: 2, line: 'Detectado como R6.', ids: ['R6'] },
		]);
	});
});
