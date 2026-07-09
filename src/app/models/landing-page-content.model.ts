import type { AuthorTeaser } from '@models/author.model';
import type { ContentCampaign } from '@models/content-campaign.model';
import type { StorylistTeaser } from '@models/storylist.model';
import type { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import type { Tag } from '@models/tag.model';

export interface HighlightedAuthor {
	author: AuthorTeaser;
	tags: Tag[];
	storyCount: number;
}

export interface LandingPageContent {
	_id: string;
	config: string;
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
	mostRead: StoryNavigationTeaserWithAuthor[];
	latestReads: StoryNavigationTeaserWithAuthor[];
	highlightedAuthors: HighlightedAuthor[];
}

export interface RotatingContent {
	_id: string;
	name: string;
	mostRead: StoryNavigationTeaserWithAuthor[];
}
