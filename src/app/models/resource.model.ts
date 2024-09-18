import { Icon } from '@models/icon.model';
import { TextBlockContent } from '@models/block-content.model';

export interface Resource {
	title: string;
	url: string;
	resourceType: ResourceType;
}

export interface ResourceType {
	title: string;
	shortDescription: string;
	description: TextBlockContent[];
	icon: Icon;
}
