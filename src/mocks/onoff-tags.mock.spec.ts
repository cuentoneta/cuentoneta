import { onoffRawTagsMock, rawTagWithoutIconMetadata } from './onoff-raw-tags.mock';
import { onoffTagsMock, onoffTagsWithShortTitles } from './onoff-tags.mock';

describe('corpus de etiquetas de Onoff', () => {
	it('keeps the domain corpus aligned with the raw corpus', () => {
		expect(onoffTagsMock).toHaveLength(onoffRawTagsMock.length);
		expect(onoffTagsMock.map((tag) => tag.slug)).toEqual(onoffRawTagsMock.map((raw) => raw.slug));
	});

	// El schema declara el ícono requerido: el corpus crudo lo provee siempre, y el de dominio lo hereda.
	it('gives every raw tag an icon with provider and name', () => {
		onoffRawTagsMock.forEach((raw) => {
			expect(raw.icon.provider).toBeTruthy();
			expect(raw.icon.name).toBeTruthy();
		});
	});

	it('exposes an icon-less raw tag to exercise the ACL normalization', () => {
		expect(rawTagWithoutIconMetadata.icon.provider).toBeUndefined();
		expect(rawTagWithoutIconMetadata.icon.name).toBeUndefined();
	});

	// Contrato del que dependen las stories de TagsList: demuestran cuántos tags entran sin contador, y un
	// título de dos palabras forzaría el recorte por ancho antes de tiempo.
	it('selects only single-word titles for the short-title collection', () => {
		expect(onoffTagsWithShortTitles.length).toBeGreaterThanOrEqual(5);
		onoffTagsWithShortTitles.forEach((tag) => expect(tag.title).not.toContain(' '));
	});
});
