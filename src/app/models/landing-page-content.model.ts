import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';

export interface LandingPageContent {
	_id: string;
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
	mostRead: StoryNavigationTeaserWithAuthor[];
}
