import { mapTags } from '../api/_utils/functions';
import { onoffRawTagsMock, rawTagWithoutIconMetadata } from './onoff-raw-tags.mock';
import { onoffTagsMock, onoffTagsWithShortTitles, toDomainTag } from './onoff-tags.mock';

describe('corpus de etiquetas de Onoff', () => {
	it('keeps the domain corpus aligned with the raw corpus', () => {
		expect(onoffTagsMock).toHaveLength(onoffRawTagsMock.length);
		expect(onoffTagsMock.map((tag) => tag.slug)).toEqual(onoffRawTagsMock.map((raw) => raw.slug));
	});

	// `toDomainTag` duplica la normalización del ícono que hace el ACL, porque importar el mapper desde el
	// corpus arrastraría `@sanity/client` al bundle del frontend y a Storybook. Un spec sí puede importarlo:
	// esta igualdad es la que impide que las dos copias diverjan.
	it('derives the domain corpus exactly as the ACL would map the raw one', () => {
		expect(mapTags(onoffRawTagsMock)).toEqual(onoffTagsMock);
	});

	// El corpus trae siempre `provider` y `name`, así que la rama de fallback del derivador no la alcanza
	// la paridad de arriba: se la ejercita con la etiqueta de borde, que es justo para lo que existe.
	it('derives the icon-less tag exactly as the ACL would map it', () => {
		expect(mapTags([rawTagWithoutIconMetadata])).toEqual([toDomainTag(rawTagWithoutIconMetadata)]);
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
