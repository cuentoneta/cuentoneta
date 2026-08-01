import type { StoryNavigationTeaser, StoryNavigationTeaserWithAuthor } from '@models/story.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';

/**
 * TODO: adapter temporal — se elimina cuando existan los endpoints LiteraryWork nativos.
 *
 * Traduce las vistas de navegación de `Story` a la proyección de `LiteraryWork` que consume la
 * tarjeta. Story y LiteraryWork son entidades paralelas: la traducción vive acotada a los
 * consumidores de la tríada y no ensucia ninguno de los dos modelos.
 *
 * `sectionCount` es 1 porque una `Story` es un cuerpo único, sin secciones.
 */
export function adaptStoryTeaserToLiteraryWorkTeaser(
	story: StoryNavigationTeaser | StoryNavigationTeaserWithAuthor,
): LiteraryWorkNavigationTeaserWithAuthors {
	return {
		_id: story._id,
		slug: createSlug(story.slug),
		title: story.title,
		coverImage: story.coverImage,
		// `approximateReadingTime` es un número libre; `ReadingTime` exige entero ≥ 1.
		totalReadingTime: createReadingTime(Math.max(1, Math.round(story.approximateReadingTime))),
		sectionCount: 1,
		tags: story.tags,
		mediaSources: story.media,
		authors: 'author' in story ? [story.author] : [],
	};
}
