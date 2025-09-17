import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';
import { StoryNavigationTeaserWithAuthor, StoryTeaserWithAuthor } from '@models/story.model';

export interface LandingPageContent {
	_id: string;
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
	mostRead: StoryNavigationTeaserWithAuthor[];
	highlighted: StoryTeaserWithAuthor[];
}
