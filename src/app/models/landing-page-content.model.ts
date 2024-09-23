import { StorylistTeaser } from '@models/storylist.model';
import { ContentCampaign } from '@models/content-campaign.model';

export interface LandingPageContent {
	cards: StorylistTeaser[];
	// TODO: Transformar propiedad en obligatoria al actualizar método de request de frontend
	campaigns?: ContentCampaign[];
}
