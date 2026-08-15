import { describe, expect, it } from 'vitest';

import {
	applyCorrection,
	applySectionCorrections,
	CORRECTION_STATUSES,
	UncorrectableLiteraryWorkError,
} from './apply-corrections';
import { CORRECTION_KINDS, type Correction } from './corrections';

// Fixtures sintéticas con la forma relevada, nunca el texto de las obras: un spec anclado en prosa de
// producción quedaría atado a un texto que esta misma migración modifica.
const ANCHOR = '**UN AVISO**';

const quoteCorrection: Correction = {
	id: 'aviso',
	kind: CORRECTION_KINDS.quoteRuledBlock,
	anchor: ANCHOR,
};

const literalCorrection: Correction = {
	id: 'firma',
	kind: CORRECTION_KINDS.replaceLiteral,
	search: 'Un beso de tu\n\nJosé',
	replacement: 'Un beso de tu\n\n*José*',
};

const framedBody = [
	'Tomó el papel y leyó:',
	'',
	'---',
	'',
	ANCHOR,
	'',
	'El cuerpo del aviso.',
	'',
	'---',
	'',
	'—¿Qué significa esto?',
].join('\n');

describe('applyCorrection — replace-literal', () => {
	it('applies the replacement and leaves the rest of the body untouched', () => {
		const body = `Antes.\n\nUn beso de tu\n\nJosé\n\nDespués.`;

		const result = applyCorrection(body, literalCorrection);

		expect(result.status).toBe(CORRECTION_STATUSES.applied);
		expect(result.body).toBe(`Antes.\n\nUn beso de tu\n\n*José*\n\nDespués.`);
	});

	it('reports an already corrected body without changing it', () => {
		const body = `Un beso de tu\n\n*José*`;

		const result = applyCorrection(body, literalCorrection);

		expect(result.status).toBe(CORRECTION_STATUSES.already);
		expect(result.body).toBe(body);
	});

	// Ausente no lanza: la corrección puede vivir en otra sección del mismo documento.
	it('reports absence instead of throwing', () => {
		const result = applyCorrection('Un cuerpo sin nada de esto.', literalCorrection);

		expect(result.status).toBe(CORRECTION_STATUSES.absent);
	});

	it('throws when the searched text appears more than once', () => {
		const body = `Un beso de tu\n\nJosé\n\nY otra vez: Un beso de tu\n\nJosé`;

		expect(() => applyCorrection(body, literalCorrection)).toThrow(UncorrectableLiteraryWorkError);
	});

	// Una entrada así vuelve a coincidir consigo misma en la segunda corrida: se aplicaría de nuevo y
	// el contador dejaría de ser señal de idempotencia.
	it('throws when the replacement contains the searched text', () => {
		const notIdempotent: Correction = {
			id: 'no-idempotente',
			kind: CORRECTION_KINDS.replaceLiteral,
			search: 'José',
			replacement: '*José*',
		};

		expect(() => applyCorrection('Un beso de tu\n\nJosé', notIdempotent)).toThrow(UncorrectableLiteraryWorkError);
	});
});

describe('applyCorrection — quote-ruled-block', () => {
	it('turns the framed block into a quote and drops its rules', () => {
		const result = applyCorrection(framedBody, quoteCorrection);

		expect(result.status).toBe(CORRECTION_STATUSES.applied);
		expect(result.body).toBe(
			['Tomó el papel y leyó:', '', `> ${ANCHOR}`, '>', '> El cuerpo del aviso.', '', '—¿Qué significa esto?'].join(
				'\n',
			),
		);
	});

	// El caso central: el cuerpo de una obra tiene separadores de escena que son la misma construcción
	// que el marco del aviso. Solo se consumen los dos contiguos al ancla.
	it('leaves the other rules of the body untouched', () => {
		const body = ['Primera escena.', '', '---', '', framedBody, '', '---', '', 'Última escena.'].join('\n');

		const result = applyCorrection(body, quoteCorrection);

		expect(result.body.startsWith('Primera escena.\n\n---\n\n')).toBe(true);
		expect(result.body.endsWith('\n\n---\n\nÚltima escena.')).toBe(true);
		expect(result.body).toContain(`> ${ANCHOR}`);
	});

	// El mismo texto del ancla puede aparecer citado dentro de un párrafo. Localizarlo como subcadena
	// citaría ese párrafo y borraría los cortes de escena que lo rodean, dejando el aviso sin corregir
	// y sin ninguna señal, porque el estado sería el de una corrección aplicada.
	it('ignores the anchor text mentioned inside a paragraph', () => {
		const body = [
			'Escena uno.',
			'',
			'---',
			'',
			`Se acordó de ${ANCHOR} que había leído.`,
			'',
			'---',
			'',
			framedBody,
		].join('\n');

		const result = applyCorrection(body, quoteCorrection);

		expect(result.body).toContain(`Se acordó de ${ANCHOR} que había leído.`);
		expect(result.body).toContain(`> ${ANCHOR}`);
		expect(result.body).toContain('> El cuerpo del aviso.');
		expect(result.body.startsWith('Escena uno.\n\n---\n\n')).toBe(true);
	});

	it('preserves the quoted text verbatim, escapes included', () => {
		const body = ['Leyó:', '', '---', '', ANCHOR, '', 'Un 50\\% y un \\*asterisco\\*.', '', '---', '', 'Fin.'].join(
			'\n',
		);

		const result = applyCorrection(body, quoteCorrection);

		expect(result.body).toContain('> Un 50\\% y un \\*asterisco\\*.');
	});

	it('reports an already quoted block without changing it', () => {
		const quoted = applyCorrection(framedBody, quoteCorrection).body;

		const result = applyCorrection(quoted, quoteCorrection);

		expect(result.status).toBe(CORRECTION_STATUSES.already);
		expect(result.body).toBe(quoted);
	});

	it('reports absence when the anchor is nowhere', () => {
		const result = applyCorrection('Un cuerpo sin ancla.', quoteCorrection);

		expect(result.status).toBe(CORRECTION_STATUSES.absent);
	});

	// El ancla presente sin su marco es una inconsistencia del documento, no una ausencia: ninguna otra
	// sección puede desmentirla, así que lanza.
	it('throws when the opening rule is missing', () => {
		const body = ['Leyó:', '', ANCHOR, '', 'El cuerpo del aviso.', '', '---', '', 'Fin.'].join('\n');

		expect(() => applyCorrection(body, quoteCorrection)).toThrow(UncorrectableLiteraryWorkError);
	});

	it('throws when the closing rule is missing', () => {
		const body = ['Leyó:', '', '---', '', ANCHOR, '', 'El cuerpo del aviso.'].join('\n');

		expect(() => applyCorrection(body, quoteCorrection)).toThrow(UncorrectableLiteraryWorkError);
	});

	it('throws when the anchor appears twice', () => {
		const body = [framedBody, '', framedBody].join('\n');

		expect(() => applyCorrection(body, quoteCorrection)).toThrow(UncorrectableLiteraryWorkError);
	});

	// Dos líneas ancla consecutivas comparten el salto que las separa. Contar por partición las lee
	// como una sola y el guard de ambigüedad no llega a activarse.
	it('throws when two anchor lines are adjacent', () => {
		const body = ['Leyó:', '', '---', '', ANCHOR, ANCHOR, '', '---', '', 'Fin.'].join('\n');

		expect(() => applyCorrection(body, quoteCorrection)).toThrow(UncorrectableLiteraryWorkError);
	});
});

describe('UncorrectableLiteraryWorkError', () => {
	it('names the correction that could not be applied', () => {
		const body = ['Leyó:', '', ANCHOR, '', 'El cuerpo.'].join('\n');

		expect(() => applyCorrection(body, quoteCorrection)).toThrow(/corrección "aviso"/);
	});
});

describe('applySectionCorrections', () => {
	it('folds every correction over the body and reports each status', () => {
		const body = [framedBody, '', 'Un beso de tu', '', 'José'].join('\n');

		const result = applySectionCorrections(body, [quoteCorrection, literalCorrection]);

		expect(result.statuses).toEqual({ aviso: CORRECTION_STATUSES.applied, firma: CORRECTION_STATUSES.applied });
		expect(result.body).toContain(`> ${ANCHOR}`);
		expect(result.body).toContain('*José*');
	});

	it('is idempotent: a second fold reports every correction as already applied', () => {
		const body = [framedBody, '', 'Un beso de tu', '', 'José'].join('\n');
		const once = applySectionCorrections(body, [quoteCorrection, literalCorrection]).body;

		const twice = applySectionCorrections(once, [quoteCorrection, literalCorrection]);

		expect(twice.statuses).toEqual({ aviso: CORRECTION_STATUSES.already, firma: CORRECTION_STATUSES.already });
		expect(twice.body).toBe(once);
	});
});
