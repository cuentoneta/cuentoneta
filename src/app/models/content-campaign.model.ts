import { TextBlockContent } from '@models/block-content.model';

type Viewport = 'xs' | 'md';

export interface ContentCampaign {
	title: string;
	slug: string;
	description: TextBlockContent[];
	url: string;
	contents: { [key in Viewport]: { title: TextBlockContent[]; subtitle: TextBlockContent[]; imageUrl: string } };
}
