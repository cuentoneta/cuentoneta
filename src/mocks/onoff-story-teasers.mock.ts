import type {
	Story,
	StoryNavigationTeaser,
	StoryNavigationTeaserWithAuthor,
	StoryTeaserWithAuthor,
} from '@models/story.model';
import { isSpaceRecording } from '@models/media.model';
import { authorTeaserMock } from './author.mock';
import { onoffStoriesMock } from './onoff-stories.mock';
import { elOdioStoryMock } from './onoff/el-odio.mock';
import { elTratadoDeLosPlaceresStoryMock } from './onoff/el-tratado-de-los-placeres.mock';
import { geometriaStoryMock } from './onoff/geometria.mock';
import { lasDosAntorchasStoryMock } from './onoff/las-dos-antorchas.mock';
import { lasEscalerasStoryMock } from './onoff/las-escaleras.mock';
import { losPeldanosStoryMock } from './onoff/los-peldanos.mock';
import { neronStoryMock } from './onoff/neron.mock';
import { palacioNueveFronterasStoryMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

// El ACL de teaser no resuelve la url del space recording (su proyección no trae audioUrl), así que el
// teaser derivado tampoco puede traerla: con la url resuelta, el mock prometería más que el mapeo real.
function toTeaserMedia(media: Story['media']): Story['media'] {
	return media.map((mediaResource) =>
		isSpaceRecording(mediaResource) ? { ...mediaResource, data: { ...mediaResource.data, url: null } } : mediaResource,
	);
}

// Deriva el teaser desde la story completa: toma los campos de la vista de teaser, trunca el cuerpo a los
// primeros 3 párrafos (igual que el ACL con body[0...3]) y reemplaza el autor por su variante AuthorTeaser.
function toTeaser(story: Story): StoryTeaserWithAuthor {
	return {
		_id: story._id,
		title: story.title,
		slug: story.slug,
		approximateReadingTime: story.approximateReadingTime,
		badLanguage: story.badLanguage,
		coverImage: story.coverImage,
		resources: story.resources,
		tags: story.tags,
		paragraphs: story.paragraphs.slice(0, 3),
		media: toTeaserMedia(story.media),
		originalPublication: story.originalPublication,
		author: authorTeaserMock,
	};
}

export const palacioNueveFronterasTeaserMock = toTeaser(palacioNueveFronterasStoryMock);
export const geometriaTeaserMock = toTeaser(geometriaStoryMock);
export const losPeldanosTeaserMock = toTeaser(losPeldanosStoryMock);
export const lasEscalerasTeaserMock = toTeaser(lasEscalerasStoryMock);
export const elOdioTeaserMock = toTeaser(elOdioStoryMock);
export const elTratadoDeLosPlaceresTeaserMock = toTeaser(elTratadoDeLosPlaceresStoryMock);
export const lasDosAntorchasTeaserMock = toTeaser(lasDosAntorchasStoryMock);
export const neronTeaserMock = toTeaser(neronStoryMock);

// La vista de navegación no proyecta el cuerpo ni los tags: el ACL la devuelve con `paragraphs` y
// `tags` vacíos. Tampoco proyecta la autoría en el listado por autor, donde es el contexto de la
// consulta.
function toNavigationTeaser(story: Story): StoryNavigationTeaser {
	return {
		_id: story._id,
		title: story.title,
		slug: story.slug,
		approximateReadingTime: story.approximateReadingTime,
		badLanguage: story.badLanguage,
		coverImage: story.coverImage,
		resources: story.resources,
		tags: [],
		paragraphs: [],
		media: toTeaserMedia(story.media),
		originalPublication: story.originalPublication,
	};
}

export const onoffStoryTeasersMock: StoryTeaserWithAuthor[] = [
	palacioNueveFronterasTeaserMock,
	geometriaTeaserMock,
	losPeldanosTeaserMock,
	lasEscalerasTeaserMock,
	elOdioTeaserMock,
	elTratadoDeLosPlaceresTeaserMock,
	lasDosAntorchasTeaserMock,
	neronTeaserMock,
];

// Proyecciones de navegación del corpus: sin autor (las devuelve el listado por autor) y con autor
// (las devuelve la colección, que puede reunir obras de varios).
export const onoffStoryNavigationTeasersMock: StoryNavigationTeaser[] = onoffStoriesMock.map(toNavigationTeaser);

export const onoffStoryNavigationTeasersWithAuthorMock: StoryNavigationTeaserWithAuthor[] =
	onoffStoryNavigationTeasersMock.map((teaser) => ({ ...teaser, author: authorTeaserMock }));
