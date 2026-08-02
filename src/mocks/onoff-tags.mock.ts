import type { Tag } from '@models/tag.model';
import type { RawTag } from './onoff-raw-tags.mock';
import {
	absurdoRawTag,
	alegoriaRawTag,
	colaborativaRawTag,
	cuentoRawTag,
	dramaHistoricoRawTag,
	dramaPsicologicoRawTag,
	ensayoRawTag,
	experimentalRawTag,
	filosoficoRawTag,
	metaficcionRawTag,
	novelaRawTag,
	surrealismoRawTag,
	teatroRawTag,
	tragediaRawTag,
} from './onoff-raw-tags.mock';

// Replica la normalización que aplica `mapTags` en el ACL. Se duplica a propósito en vez de importar el
// mapper: `src/mocks/**` lo consume el frontend y Storybook, e importar el ACL arrastraría `@sanity/client`
// al bundle. La igualdad `mapTags(onoffRawTagsMock) === onoffTagsMock` de `onoff-tags.mock.spec.ts` es lo
// que vigila que las dos copias no diverjan.
export function toDomainTag(raw: RawTag): Tag {
	return {
		title: raw.title,
		slug: raw.slug,
		shortDescription: raw.shortDescription,
		icon: { provider: raw.icon.provider ?? '', name: raw.icon.name ?? '' },
	};
}

// Tipo literario de la obra. Va primero en `tags` de cada Story: los componentes que muestran un único tag
// —el hero de la página de story, entre otros— toman `tags[0]` y lo presentan como etiqueta principal.
export const cuentoTagMock = toDomainTag(cuentoRawTag);
export const novelaTagMock = toDomainTag(novelaRawTag);
export const ensayoTagMock = toDomainTag(ensayoRawTag);
export const teatroTagMock = toDomainTag(teatroRawTag);

// Género de la obra. Acompañan al tipo literario como tags adicionales.
export const dramaPsicologicoTagMock = toDomainTag(dramaPsicologicoRawTag);
export const metaficcionTagMock = toDomainTag(metaficcionRawTag);
export const absurdoTagMock = toDomainTag(absurdoRawTag);
export const surrealismoTagMock = toDomainTag(surrealismoRawTag);
export const alegoriaTagMock = toDomainTag(alegoriaRawTag);
export const filosoficoTagMock = toDomainTag(filosoficoRawTag);
export const experimentalTagMock = toDomainTag(experimentalRawTag);
export const tragediaTagMock = toDomainTag(tragediaRawTag);
export const dramaHistoricoTagMock = toDomainTag(dramaHistoricoRawTag);

// Curaduría de la colección: no describe la obra sino cómo se armó la lista que la contiene.
export const colaborativaTagMock = toDomainTag(colaborativaRawTag);

// Se lista desde los exports nombrados, no con `onoffRawTagsMock.map(...)`: así la colección y cada tag
// suelto son el mismo objeto, y las igualdades por referencia del corpus siguen valiendo. El orden es el
// del canon crudo, y el spec del corpus lo verifica.
export const onoffTagsMock: Tag[] = [
	cuentoTagMock,
	novelaTagMock,
	ensayoTagMock,
	teatroTagMock,
	dramaPsicologicoTagMock,
	metaficcionTagMock,
	absurdoTagMock,
	surrealismoTagMock,
	alegoriaTagMock,
	filosoficoTagMock,
	experimentalTagMock,
	tragediaTagMock,
	dramaHistoricoTagMock,
	colaborativaTagMock,
];

// Un título de dos palabras fuerza el recorte por ancho antes de tiempo; las stories de TagsList que
// demuestran cuántos tags entran sin contador necesitan títulos de una sola palabra.
export const onoffTagsWithShortTitles: Tag[] = onoffTagsMock.filter((tag) => !tag.title.includes(' '));
