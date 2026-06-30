import type {
	RotatingContentQueryResult,
	StoriesByAuthorSlugQueryResult,
	StoryBySlugQueryResult,
} from '../sanity/types';
import { rawOnoffAuthorTeaser } from './onoff-raw-author.mock';
import { elOdioRawStory } from './onoff/el-odio.raw.mock';
import { elPalacioRawStory } from './onoff/el-palacio-de-las-nueve-fronteras.raw.mock';
import { elTratadoRawStory } from './onoff/el-tratado-de-los-placeres.raw.mock';
import { geometriaRawStory } from './onoff/geometria.raw.mock';
import { lasDosAntorchasRawStory } from './onoff/las-dos-antorchas.raw.mock';
import { lasEscalerasRawStory } from './onoff/las-escaleras.raw.mock';
import { losPeldanosRawStory } from './onoff/los-peldanos.raw.mock';
import { neronRawStory } from './onoff/neron.raw.mock';

// Corpus crudo del autor Onoff en shape de GROQ, espejo de src/app/mocks/onoff-stories.mock.ts. El orden coincide
// con el del frontend para facilitar comparaciones de paridad.
export const onoffRawStoriesMock: NonNullable<StoryBySlugQueryResult>[] = [
	elPalacioRawStory,
	geometriaRawStory,
	losPeldanosRawStory,
	lasEscalerasRawStory,
	elOdioRawStory,
	elTratadoRawStory,
	lasDosAntorchasRawStory,
	neronRawStory,
];

// Proyecta el sub-shape de teaser de autor (`storiesByAuthorSlugQuery`): trunca el cuerpo a los primeros 3 bloques
// (igual que `coalesce(body[0...3], [])`) y descarta `author`, `epigraphs`, `review` y `tags`.
function toRawTeaser(raw: NonNullable<StoryBySlugQueryResult>): StoriesByAuthorSlugQueryResult[0] {
	return {
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		badLanguage: raw.badLanguage,
		body: raw.body.slice(0, 3),
		originalPublication: raw.originalPublication,
		approximateReadingTime: raw.approximateReadingTime,
		coverImage: raw.coverImage,
		mediaSources: raw.mediaSources,
		resources: raw.resources,
	};
}

// Proyecta el sub-shape de nav-teaser con autor (`mostRead` de `rotatingContentQuery`): `body` y `resources`
// vacíos, y el autor en su variante de teaser (`biography: []`, `resources: []`).
function toRawNavTeaser(
	raw: NonNullable<StoryBySlugQueryResult>,
): NonNullable<RotatingContentQueryResult>['mostRead'][0] {
	return {
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		badLanguage: raw.badLanguage,
		body: [],
		originalPublication: raw.originalPublication,
		approximateReadingTime: raw.approximateReadingTime,
		coverImage: raw.coverImage,
		resources: [],
		mediaSources: raw.mediaSources,
		author: rawOnoffAuthorTeaser,
	};
}

export const elPalacioRawTeaser = toRawTeaser(elPalacioRawStory);
export const geometriaRawTeaser = toRawTeaser(geometriaRawStory);
export const losPeldanosRawTeaser = toRawTeaser(losPeldanosRawStory);
export const lasEscalerasRawTeaser = toRawTeaser(lasEscalerasRawStory);
export const elOdioRawTeaser = toRawTeaser(elOdioRawStory);
export const elTratadoRawTeaser = toRawTeaser(elTratadoRawStory);
export const lasDosAntorchasRawTeaser = toRawTeaser(lasDosAntorchasRawStory);
export const neronRawTeaser = toRawTeaser(neronRawStory);

export const onoffRawTeasersMock: StoriesByAuthorSlugQueryResult = [
	elPalacioRawTeaser,
	geometriaRawTeaser,
	losPeldanosRawTeaser,
	lasEscalerasRawTeaser,
	elOdioRawTeaser,
	elTratadoRawTeaser,
	lasDosAntorchasRawTeaser,
	neronRawTeaser,
];

export const onoffRawNavTeasersMock: NonNullable<RotatingContentQueryResult>['mostRead'] = [
	toRawNavTeaser(elPalacioRawStory),
	toRawNavTeaser(geometriaRawStory),
	toRawNavTeaser(losPeldanosRawStory),
	toRawNavTeaser(lasEscalerasRawStory),
	toRawNavTeaser(elOdioRawStory),
	toRawNavTeaser(elTratadoRawStory),
	toRawNavTeaser(lasDosAntorchasRawStory),
	toRawNavTeaser(neronRawStory),
];
