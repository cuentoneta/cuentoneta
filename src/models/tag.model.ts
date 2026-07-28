import { TextBlockContent } from '@models/block-content.model';

export interface Tag {
	title: string;
	slug: string;
	shortDescription: string;
	description: TextBlockContent[];
	icon?: Record<string, string>;
}
