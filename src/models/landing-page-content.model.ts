import type { CollectionTeaser } from '@models/collection.model';
import type { ContentCampaign } from '@models/content-campaign.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import type { AuthorTeaser } from '@models/author.model';
import type { Tag } from '@models/tag.model';

// Las etiquetas y el conteo viven acá y no en el teaser: el teaser entrega su lista de etiquetas vacía
// en toda vista del repositorio, y el conteo lo paga solo esta pantalla.
export interface HighlightedAuthor {
	readonly author: AuthorTeaser;
	readonly tags: readonly Tag[];
	readonly storyCount: number;
}

// Los destacados viajan como vista de navegación y no como teaser de obra: el teaser exige el extracto
// del arranque, y ninguna de las dos tarjetas de la página de inicio pinta cuerpo.
//
// `mostRead` y `latestReads` conservan su nombre porque nombran el rol editorial del slot, que no
// cambió. `collections` sí se renombró: `cards` nombraba el componente que lo pintaba.
export interface LandingPageContent {
	readonly _id: string;
	readonly config: string;
	readonly collections: readonly CollectionTeaser[];
	readonly campaigns: readonly ContentCampaign[];
	readonly mostRead: readonly LiteraryWorkNavigationTeaserWithAuthors[];
	readonly latestReads: readonly LiteraryWorkNavigationTeaserWithAuthors[];
	readonly highlightedAuthors: readonly HighlightedAuthor[];
}

export interface RotatingContent {
	readonly _id: string;
	readonly name: string;
	readonly mostRead: readonly LiteraryWorkNavigationTeaserWithAuthors[];
}
