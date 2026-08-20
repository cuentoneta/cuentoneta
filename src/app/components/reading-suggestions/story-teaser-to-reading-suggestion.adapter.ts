import type { StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import type { TextBlockContent } from '@models/block-content.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';

type StoryTeaserView = StoryTeaser | StoryTeaserWithAuthor;

/**
 * TODO(#2037): view model temporal — se elimina cuando existan los endpoints LiteraryWork nativos.
 *
 * El extracto viaja aparte de la obra porque su forma no es la misma: una `LiteraryWork` lo sirve como
 * `SanitizedHtml` en su `teaserSection`, mientras que una `Story` lo tiene en Portable Text. Sumarlo a
 * la proyección de obra la haría mentir sobre lo que transporta.
 */
export interface ReadingSuggestion {
	readonly literaryWork: LiteraryWorkNavigationTeaserWithAuthors;
	readonly excerptParagraphs: TextBlockContent[];
}

/**
 * TODO(#2037): adapter temporal — se elimina cuando existan los endpoints LiteraryWork nativos.
 *
 * Traduce las vistas de teaser de `Story` a lo que consume el bloque de sugerencias. Story y
 * LiteraryWork son entidades paralelas: la traducción vive acotada a los consumidores de la tríada y no
 * ensucia ninguno de los dos modelos.
 *
 * `sectionCount` es 1 porque una `Story` es un cuerpo único, sin secciones.
 */
export function adaptStoryTeaserToReadingSuggestion(story: StoryTeaserView): ReadingSuggestion {
	// El schema declara `approximateReadingTime` requerido, pero esa regla solo gobierna la edición en
	// el Studio: hay obras persistidas sin el valor. Sin este guard, `Math.round` produce `NaN` y el
	// value object falla nombrando el `NaN` en vez del dato que falta.
	if (typeof story.approximateReadingTime !== 'number') {
		throw new Error(`La obra "${story.slug}" no tiene tiempo de lectura`);
	}

	return {
		literaryWork: {
			_id: story._id,
			slug: createSlug(story.slug),
			title: story.title,
			coverImage: story.coverImage,
			// `approximateReadingTime` es un número libre; `ReadingTime` exige entero ≥ 1.
			totalReadingTime: createReadingTime(Math.max(1, Math.round(story.approximateReadingTime))),
			sectionCount: 1,
			tags: story.tags,
			// El teaser de Story todavía transporta la vista completa; acá se angosta, que es lo que la
			// vista de navegación declara y lo único que la tarjeta consume.
			mediaSources: story.media.map((media) => ({ type: media.type, title: media.title })),
			authors: 'author' in story ? [story.author] : [],
		},
		excerptParagraphs: story.paragraphs,
	};
}

/**
 * Adapta un listado descartando las obras que no se pueden traducir. Los value objects del dominio
 * fallan rápido ante un dato inválido, pero acá se trata de un bloque accesorio al pie de la
 * lectura: una obra con un slug que el CMS dejó inconsistente no debe llevarse puestas a las demás.
 */
export function adaptStoryTeasersToReadingSuggestions(stories: readonly StoryTeaserView[]): ReadingSuggestion[] {
	return stories.reduce<ReadingSuggestion[]>((adapted, story) => {
		try {
			adapted.push(adaptStoryTeaserToReadingSuggestion(story));
		} catch (cause) {
			console.warn(`Obra descartada de las sugerencias de lectura: "${story.slug}"`, cause);
		}
		return adapted;
	}, []);
}
