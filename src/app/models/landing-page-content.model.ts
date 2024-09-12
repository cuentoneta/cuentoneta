import { Storylist, StorylistTeaser } from '@models/storylist.model';

export interface LandingPageContent {
	cards: StorylistTeaser[];
	previews: Storylist[];
}
