import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import type { AuthorTeaser } from '@models/author.model';
import type { Tag } from '@models/tag.model';

// Las etiquetas viven acá y no en el teaser porque son las de esta tirada: las puntuales de la semana
// primero y después las que el autor ya tiene asignadas. El teaser las entrega vacías en toda vista.
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
