import { TextBlockContent } from '@models/block-content.model';

type Viewport = 'xs' | 'md';

export interface ContentCampaign {
	slug: string;
	url: string;
	description: TextBlockContent[];
	contents: { [key in Viewport]: { title: TextBlockContent[]; subtitle: TextBlockContent[]; imageUrl: string } };
}
