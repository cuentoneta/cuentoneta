import { TextBlockContent } from '@models/block-content.model';

export interface Resource {
	title: string;
	url: string;
	resourceType: ResourceType;
}

export interface ResourceType {
	slug: string;
	title: string;
	shortDescription: string;
	description: TextBlockContent[];
	icon: Record<string, string>;
}
