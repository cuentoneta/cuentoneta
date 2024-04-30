import { Icon } from '@models/icon.model';

export interface Resource {
	title: string;
	url: string;
	resourceType: ResourceType;
}

export interface ResourceType {
	title: string;
	slug: string;
	description: string;
	icon?: Icon;
}
