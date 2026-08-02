import { mapTags } from '../api/_utils/functions';
import { onoffRawTagsMock } from './onoff-raw-tags.mock';
import { onoffTagsMock, onoffTagsWithShortTitles } from './onoff-tags.mock';

describe('corpus de etiquetas de Onoff', () => {
	it('keeps the domain corpus aligned with the raw corpus', () => {
		expect(onoffTagsMock).toHaveLength(onoffRawTagsMock.length);
		expect(onoffTagsMock.map((tag) => tag.slug)).toEqual(onoffRawTagsMock.map((raw) => raw.slug));
	});

	// El corpus es el fixture con el que specs y stories hacen de cuenta que son la respuesta de la API: si
	// deja de coincidir con lo que el ACL produce, todo lo que lo consume pasa en verde mintiendo. Esta
	// igualdad es lo que obliga a mover las dos puntas juntas ante un cambio de contrato.
	it('derives the domain corpus exactly as the ACL would map the raw one', () => {
		expect(mapTags(onoffRawTagsMock)).toEqual(onoffTagsMock);
	});

	// Contrato del que dependen las stories de TagsList: demuestran cuántos tags entran sin contador, y un
	// título de dos palabras forzaría el recorte por ancho antes de tiempo.
	it('selects only single-word titles for the short-title collection', () => {
		expect(onoffTagsWithShortTitles.length).toBeGreaterThanOrEqual(5);
		onoffTagsWithShortTitles.forEach((tag) => expect(tag.title).not.toContain(' '));
	});
});
