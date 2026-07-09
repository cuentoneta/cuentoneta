import type { Story, StoryTeaserWithAuthor } from '@models/story.model';
import { authorTeaserMock } from './author.mock';
import { elOdioStoryMock } from './onoff/el-odio.mock';
import { elTratadoDeLosPlaceresStoryMock } from './onoff/el-tratado-de-los-placeres.mock';
import { geometriaStoryMock } from './onoff/geometria.mock';
import { lasDosAntorchasStoryMock } from './onoff/las-dos-antorchas.mock';
import { lasEscalerasStoryMock } from './onoff/las-escaleras.mock';
import { losPeldanosStoryMock } from './onoff/los-peldanos.mock';
import { neronStoryMock } from './onoff/neron.mock';
import { palacioNueveFronterasStoryMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

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
