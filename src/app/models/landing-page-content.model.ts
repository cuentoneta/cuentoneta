import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';
import { StoryNavigationTeaser } from '@models/story.model';

export interface LandingPageContent {
	_id: string;
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
	mostRead: StoryNavigationTeaser[];
}
