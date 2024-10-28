import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';

export interface LandingPageContent {
	cards: StorylistTeaser[];
	campaigns: ContentCampaign[];
}
