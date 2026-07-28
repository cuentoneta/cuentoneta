import type { SanityClient } from '@sanity/client';
import { clearAllMocks, fn } from '@test-utils';
import { createMarkdown } from './markdown.model';
import { deriveSectionReadingTime, deriveTotalReadingTime } from './reading-time.model';
import {
	applyReadingTimeMaterialization,
	buildReadingTimeMaterialization,
	type ReadingTimeMaterializationInput,
	type ReadingTimeMaterializationWriter,
} from './reading-time-materialization.model';

const bodyOne = createMarkdown('El odio no empezó por nada. Estaba ahí desde antes, igual que el peso del cuerpo.');
const bodyTwo = createMarkdown('Le faltaba todavía la voz. Para darle una voz tuve que perder la mía, dijo el hombre.');

const sectionOnePath = 'content[_key=="section-1"].readingTime';
const sectionTwoPath = 'content[_key=="section-2"].readingTime';

function allMissingInput(): ReadingTimeMaterializationInput {
	return {
		sections: [
			{ _key: 'section-1', body: bodyOne, readingTime: null },
			{ _key: 'section-2', body: bodyTwo, readingTime: null },
		],
		totalReadingTime: null,
	};
}

describe('buildReadingTimeMaterialization', () => {
	it('con todos los campos presentes no arma patch y sirve los valores persistidos', () => {
		const materialization = buildReadingTimeMaterialization({
			sections: [
				{ _key: 'section-1', body: bodyOne, readingTime: 3 },
				{ _key: 'section-2', body: bodyTwo, readingTime: 4 },
			],
			totalReadingTime: 7,
		});

		expect(materialization.isEmpty).toBe(true);
		expect(materialization.setIfMissing).toEqual({});
		expect(materialization.sectionReadingTimes).toEqual([3, 4]);
		expect(materialization.totalReadingTime).toBe(7);
	});

	it('con todos los campos faltantes computa cada uno y los agrega al patch', () => {
		const materialization = buildReadingTimeMaterialization(allMissingInput());

		const expectedSectionOne = deriveSectionReadingTime(bodyOne);
		const expectedSectionTwo = deriveSectionReadingTime(bodyTwo);
		const expectedTotal = deriveTotalReadingTime([bodyOne, bodyTwo]);

		expect(materialization.isEmpty).toBe(false);
		expect(materialization.setIfMissing).toEqual({
			[sectionOnePath]: expectedSectionOne,
			[sectionTwoPath]: expectedSectionTwo,
			totalReadingTime: expectedTotal,
		});
		expect(materialization.sectionReadingTimes).toEqual([expectedSectionOne, expectedSectionTwo]);
		expect(materialization.totalReadingTime).toBe(expectedTotal);
	});

	it('con algunas secciones presentes solo agrega al patch las faltantes', () => {
		const materialization = buildReadingTimeMaterialization({
			sections: [
				{ _key: 'section-1', body: bodyOne, readingTime: 5 },
				{ _key: 'section-2', body: bodyTwo, readingTime: null },
			],
			totalReadingTime: 9,
		});

		const expectedSectionTwo = deriveSectionReadingTime(bodyTwo);

		expect(materialization.setIfMissing).toEqual({ [sectionTwoPath]: expectedSectionTwo });
		expect(materialization.setIfMissing).not.toHaveProperty('totalReadingTime');
		expect(materialization.sectionReadingTimes).toEqual([5, expectedSectionTwo]);
		expect(materialization.totalReadingTime).toBe(9);
	});

	it('con el total faltante lo computa como la suma de los reading times de sección, no re-derivando los bodies', () => {
		const materialization = buildReadingTimeMaterialization({
			sections: [
				{ _key: 'section-1', body: bodyOne, readingTime: 5 },
				{ _key: 'section-2', body: bodyTwo, readingTime: 6 },
			],
			totalReadingTime: null,
		});

		// 5 + 6 = 11 (suma de las secciones resueltas), no la suma re-derivada de los bodies (~2).
		expect(materialization.setIfMissing).toEqual({ totalReadingTime: 11 });
		expect(materialization.totalReadingTime).toBe(11);
		expect(materialization.sectionReadingTimes).toEqual([5, 6]);
	});

	it('respeta el total editorial presente: lo sirve tal cual y no lo pisa ni lo recalcula del texto', () => {
		// Obra recitada: el editor cargó 40 (duración del medio), distinto de la suma del texto.
		const editorialTotal = 40;
		const materialization = buildReadingTimeMaterialization({
			sections: [{ _key: 'section-1', body: bodyOne, readingTime: null }],
			totalReadingTime: editorialTotal,
		});

		expect(materialization.totalReadingTime).toBe(editorialTotal);
		expect(materialization.setIfMissing).not.toHaveProperty('totalReadingTime');
		expect(materialization.setIfMissing).toEqual({ [sectionOnePath]: deriveSectionReadingTime(bodyOne) });
	});

	it('direcciona el patch por _key de la sección, no por índice', () => {
		const materialization = buildReadingTimeMaterialization({
			sections: [{ _key: 'una-clave-arbitraria', body: bodyOne, readingTime: null }],
			totalReadingTime: 3,
		});

		expect(Object.keys(materialization.setIfMissing)).toContain('content[_key=="una-clave-arbitraria"].readingTime');
	});

	it('es idempotente: recomputar sobre una obra ya materializada no arma patch (write-once)', () => {
		const first = buildReadingTimeMaterialization(allMissingInput());

		const alreadyMaterialized = buildReadingTimeMaterialization({
			sections: [
				{ _key: 'section-1', body: bodyOne, readingTime: first.sectionReadingTimes[0] },
				{ _key: 'section-2', body: bodyTwo, readingTime: first.sectionReadingTimes[1] },
			],
			totalReadingTime: first.totalReadingTime,
		});

		expect(alreadyMaterialized.isEmpty).toBe(true);
		expect(alreadyMaterialized.setIfMissing).toEqual({});
	});

	it('es una función pura: mismo input, mismo resultado', () => {
		expect(buildReadingTimeMaterialization(allMissingInput())).toEqual(
			buildReadingTimeMaterialization(allMissingInput()),
		);
	});
});

function createSpyWriter() {
	const commit = fn(() => Promise.resolve());
	const setIfMissing = fn(() => ({ commit }));
	const patch = fn(() => ({ setIfMissing }));
	const writer: ReadingTimeMaterializationWriter = { patch };
	return { writer, patch, setIfMissing, commit };
}

describe('applyReadingTimeMaterialization', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('no toca la red cuando no falta ningún campo', async () => {
		const { writer, patch } = createSpyWriter();
		const materialization = buildReadingTimeMaterialization({
			sections: [{ _key: 'section-1', body: bodyOne, readingTime: 3 }],
			totalReadingTime: 3,
		});

		await applyReadingTimeMaterialization(writer, 'doc-id', materialization);

		expect(patch).not.toHaveBeenCalled();
	});

	it('persiste el patch con setIfMissing sobre el documento cuando hay campos faltantes', async () => {
		const { writer, patch, setIfMissing, commit } = createSpyWriter();
		const materialization = buildReadingTimeMaterialization(allMissingInput());

		await applyReadingTimeMaterialization(writer, 'onoff-literary-work-el-odio', materialization);

		expect(patch).toHaveBeenCalledWith('onoff-literary-work-el-odio');
		expect(setIfMissing).toHaveBeenCalledWith({ ...materialization.setIfMissing });
		expect(commit).toHaveBeenCalledTimes(1);
	});
});

describe('ReadingTimeMaterializationWriter (puerto)', () => {
	it('el SanityClient real satisface el puerto de escritura (blindaje del gate typecheck)', () => {
		const client = null as unknown as SanityClient;
		const writer: ReadingTimeMaterializationWriter = client;

		expect(writer).toBeNull();
	});
});
