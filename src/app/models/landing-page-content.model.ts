import { Publication, Storylist, StorylistTeaser } from '@models/storylist.model';
import { StoryPreview } from '@models/story.model';

export interface LandingPageContent {
	cards: StorylistTeaser[];
	previews: Storylist<StoryPreview, Publication<StoryPreview>>[];
}
