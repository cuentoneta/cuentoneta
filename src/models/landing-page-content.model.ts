import type { StorylistTeaser } from '@models/storylist.model';
import type { ContentCampaign } from '@models/content-campaign.model';
import type { StoryNavigationTeaserWithAuthor } from '@models/story.model';

export interface LandingPageContent {
	_id: string;
	config: string;
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
	mostRead: StoryNavigationTeaserWithAuthor[];
	latestReads: StoryNavigationTeaserWithAuthor[];
}

export interface RotatingContent {
	_id: string;
	name: string;
	mostRead: StoryNavigationTeaserWithAuthor[];
}
