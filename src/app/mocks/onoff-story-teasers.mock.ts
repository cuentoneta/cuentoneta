import type { Story, StoryTeaserWithAuthor } from '@models/story.model';
import { authorTeaserMock } from './author.mock';
import {
	elOdioStoryMock,
	elTratadoDeLosPlaceresStoryMock,
	geometriaStoryMock,
	lasDosAntorchasStoryMock,
	lasEscalerasStoryMock,
	losPeldanosStoryMock,
	neronStoryMock,
	onoffStoriesMock,
	palacioNueveFronterasStoryMock,
} from './onoff-stories.mock';

// Deriva el teaser desde la story completa: toma los campos de la vista de teaser y reemplaza el autor
// por su variante AuthorTeaser. Los campos exclusivos de la vista completa (summary, epigraphs, fechas)
// no se propagan.
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
		paragraphs: story.paragraphs,
		media: story.media,
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

export const onoffStoryTeasersMock: StoryTeaserWithAuthor[] = onoffStoriesMock.map(toTeaser);
