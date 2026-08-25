import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';
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

export interface LandingPageContent {
	_id: string;
	config: string;
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
	mostRead: StoryNavigationTeaserWithAuthor[];
	latestReads: StoryNavigationTeaserWithAuthor[];
	readonly highlightedAuthors: readonly HighlightedAuthor[];
}

export interface RotatingContent {
	_id: string;
	name: string;
	mostRead: StoryNavigationTeaserWithAuthor[];
}
