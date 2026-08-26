import type { CollectionTeaser } from '@models/collection.model';
import { ContentCampaign } from '@models/content-campaign.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import { StorylistTeaser } from '@models/storylist.model';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import type { AuthorTeaser } from '@models/author.model';
import type { Tag } from '@models/tag.model';

// Las etiquetas y el conteo viven acá y no en el teaser: el teaser entrega su lista de etiquetas vacía
// en toda vista del repositorio, y el conteo lo paga solo esta pantalla.
export interface HighlightedAuthor {
	readonly author: AuthorTeaser;
	readonly tags: readonly Tag[];
	readonly storyCount: number;
}

/**
 * Los slots de la página de inicio conviven en dos vocabularios mientras dura la migración: `cards`,
 * `mostRead` y `latestReads` transportan storylists e historias; `collections`, `mostReadLiteraryWorks`
 * y `latestLiteraryWorks` transportan colecciones y obras.
 *
 * Los tres nuevos llevan el sufijo de entidad solo porque conviven con los viejos: `collections`
 * conserva su nombre al contraerse, y los otros dos vuelven a `mostRead` y `latestReads`, que nombran
 * el rol editorial del slot y no lo que lo llena.
 *
 * Los destacados viajan como vista de navegación y no como teaser de obra: el teaser exige el extracto
 * del arranque y ninguna de las dos tarjetas que los pintan muestra cuerpo.
 */
export interface LandingPageContent {
	readonly _id: string;
	readonly config: string;
	readonly cards: StorylistTeaser[];
	readonly collections: readonly CollectionTeaser[];
	readonly campaigns: ContentCampaign[];
	readonly mostRead: StoryNavigationTeaserWithAuthor[];
	readonly mostReadLiteraryWorks: readonly LiteraryWorkNavigationTeaserWithAuthors[];
	readonly latestReads: StoryNavigationTeaserWithAuthor[];
	readonly latestLiteraryWorks: readonly LiteraryWorkNavigationTeaserWithAuthors[];
	readonly highlightedAuthors: readonly HighlightedAuthor[];
}

export interface RotatingContent {
	readonly _id: string;
	readonly name: string;
	readonly mostRead: StoryNavigationTeaserWithAuthor[];
	readonly mostReadLiteraryWorks: readonly LiteraryWorkNavigationTeaserWithAuthors[];
}
